import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { Router, type Request } from "express";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  createAccessToken,
  createRefreshToken,
  readRefreshToken,
  type AuthRole,
} from "../auth/tokens.js";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { env, passwordResetUrl } from "../config/env.js";
import { AppError } from "../middleware/app-error.js";
import { authenticate } from "../middleware/authenticate.js";
import { User, type AccountType, type UserRecord } from "../models/user.model.js";
import { RefreshSession } from "../models/refresh-session.model.js";
import { PasswordReset } from "../models/password-reset.model.js";
import { sendPasswordResetEmail } from "../auth/password-reset-email.js";
import { logger } from "../config/logger.js";

export const authRouter = Router();
const googleClient = new OAuth2Client();

authRouter.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const emailSchema = z.email().trim().toLowerCase();
const passwordSchema = z.string().min(8).max(128);
const phoneNumberSchema = z.string().trim().transform((value, context) => {
  const phoneNumber = parsePhoneNumberFromString(value);
  if (!phoneNumber?.isValid()) {
    context.addIssue({ code: "custom", message: "Enter a valid phone number with country code, for example +919876543210" });
    return z.NEVER;
  }
  return phoneNumber.number;
});
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
const studentRegistrationSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/),
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(100),
  batchYear: z.coerce.number().int().min(1900).max(2200),
  universityRollNumber: z.string().trim().min(1).max(40),
  phoneNumber: phoneNumberSchema,
});
const clubRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  clubName: z.string().trim().min(2).max(100),
  foundedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
});
const googleSchema = z.object({ credential: z.string().min(20).max(8192) });
const adminLoginSchema = z.object({
  id: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(128),
});
const forgotPasswordSchema = z.object({ email: emailSchema });
const resetPasswordSchema = z.object({ token: z.string().min(32).max(256), password: passwordSchema });
const resetTokenLifetimeMs = 15 * 60 * 1000;
const forgotPasswordMessage = "If an account exists for that email, password reset instructions have been sent";

function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request body";
    throw new AppError(400, message);
  }
  return result.data;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function publicUser(user: UserRecord & { id: string }) {
  if (user.accountType === "student") {
    return {
      id: user.id,
      role: user.accountType,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      batchYear: user.batchYear,
      universityRollNumber: user.universityRollNumber,
      phoneNumber: user.phoneNumber,
    };
  }
  return {
    id: user.id,
    role: user.accountType,
    email: user.email,
    clubName: user.clubName,
    foundedYear: user.foundedYear,
    approvalStatus: user.approvalStatus,
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function createPasswordReset(email: string, accountType: AccountType) {
  const user = await User.findOne({ email, accountType }).select("email");
  if (!user) return undefined;

  const now = new Date();
  await PasswordReset.updateMany(
    { userId: user.id, accountType, usedAt: { $exists: false } },
    { $set: { usedAt: now } },
  );

  const token = randomBytes(32).toString("base64url");
  await PasswordReset.create({
    userId: user.id,
    accountType,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + resetTokenLifetimeMs),
  });

  const resetUrl = new URL(passwordResetUrl);
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("accountType", accountType);

  if (env.SMTP_URL && env.SMTP_FROM) {
    void sendPasswordResetEmail(user.email, resetUrl.toString()).catch((error: unknown) => {
      logger.error({ error, accountType }, "Failed to send password reset email");
    });
  }

  return { token, url: resetUrl.toString() };
}

async function completePasswordReset(accountType: AccountType, token: string, password: string): Promise<void> {
  const now = new Date();
  const reset = await PasswordReset.findOne({
    accountType,
    tokenHash: hashToken(token),
    usedAt: { $exists: false },
    expiresAt: { $gt: now },
  });
  if (!reset) throw new AppError(400, "Password reset token is invalid or expired");

  const passwordHash = await hashPassword(password);
  const consumed = await PasswordReset.findOneAndUpdate(
    { _id: reset._id, usedAt: { $exists: false }, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
    { returnDocument: "after" },
  );
  if (!consumed) throw new AppError(400, "Password reset token is invalid or expired");

  const updated = await User.updateOne(
    { _id: reset.userId, accountType },
    { $set: { passwordHash } },
  );
  if (updated.matchedCount === 0) throw new AppError(400, "Password reset token is invalid or expired");

  await RefreshSession.updateMany(
    { subject: reset.userId, role: accountType, revokedAt: null },
    { $set: { revokedAt: now } },
  );
}

function mountPasswordResetRoutes(accountType: AccountType): void {
  authRouter.post(`/${accountType}/forgot-password`, forgotPasswordLimiter, async (request, response) => {
    const { email } = parseBody(forgotPasswordSchema, request.body);
    const reset = await createPasswordReset(email, accountType);
    response.status(202).json({
      message: forgotPasswordMessage,
      ...(env.NODE_ENV === "development" && reset
        ? { developmentResetToken: reset.token, developmentResetUrl: reset.url }
        : {}),
    });
  });

  authRouter.post(`/${accountType}/reset-password`, resetPasswordLimiter, async (request, response) => {
    const { token, password } = parseBody(resetPasswordSchema, request.body);
    await completePasswordReset(accountType, token, password);
    response.status(200).json({ message: "Password reset successful. Sign in with your new password." });
  });
}

mountPasswordResetRoutes("student");
mountPasswordResetRoutes("club");

function getBearerToken(request: Request): string {
  const authorization = request.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) throw new AppError(401, "Bearer refresh token required");
  return token;
}

function getAdminCredentialVersion(): string | undefined {
  if (!env.ADMIN_ID || !env.ADMIN_PASSWORD) return undefined;
  return createHmac("sha256", env.JWT_SECRET)
    .update(env.ADMIN_ID)
    .update("\0")
    .update(env.ADMIN_PASSWORD)
    .digest("hex");
}

async function createSession(
  subject: string,
  role: AuthRole,
  user: object,
  familyId: string = randomUUID(),
  credentialVersion?: string,
) {
  const refreshToken = await createRefreshToken(subject, role, familyId);
  await RefreshSession.create({
    subject,
    role,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    credentialVersion,
  });

  return {
    accessToken: await createAccessToken(subject, role),
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    refreshTokenType: "Bearer",
    refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
    user,
  };
}

function constantTimeStringEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

authRouter.post("/student/register", async (request, response) => {
  const input = parseBody(studentRegistrationSchema, request.body);
  try {
    const user = await User.create({
      ...input,
      accountType: "student",
      passwordHash: await hashPassword(input.password),
    });
    response.status(201).json(await createSession(user.id, "student", publicUser(user)));
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new AppError(409, "Email, username, or university roll number is already registered");
    throw error;
  }
});

authRouter.post("/student/login", async (request, response) => {
  const input = parseBody(loginSchema, request.body);
  const user = await User.findOne({ email: input.email, accountType: "student" }).select("+passwordHash");
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }
  response.status(200).json(await createSession(user.id, "student", publicUser(user)));
});

authRouter.post("/club/register", async (request, response) => {
  const input = parseBody(clubRegistrationSchema, request.body);
  try {
    const user = await User.create({
      ...input,
      accountType: "club",
      approvalStatus: "pending",
      passwordHash: await hashPassword(input.password),
    });
    response.status(201).json({
      status: "pending",
      message: "Club registration submitted and is waiting for admin approval",
      club: publicUser(user),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new AppError(409, "Email is already registered");
    throw error;
  }
});

authRouter.post("/club/login", async (request, response) => {
  const input = parseBody(loginSchema, request.body);
  const user = await User.findOne({ email: input.email, accountType: "club" }).select("+passwordHash");
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }
  if (user.approvalStatus !== "approved") {
    throw new AppError(403, "Club registration is pending admin approval");
  }
  response.status(200).json(await createSession(user.id, "club", publicUser(user)));
});

authRouter.post("/google", async (request, response) => {
  const { credential } = parseBody(googleSchema, request.body);
  if (!env.GOOGLE_CLIENT_ID) throw new AppError(503, "Google sign-in is not configured");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, "Invalid Google credential");
  }

  if (!payload?.email || !payload.email_verified || !payload.sub) {
    throw new AppError(401, "Google account must have a verified email address");
  }

  const user = await User.findOne({ email: payload.email.toLowerCase(), accountType: "student" });
  if (!user) throw new AppError(404, "Register as a student with this email before using Google sign-in");
  if (user.googleSubject && user.googleSubject !== payload.sub) {
    throw new AppError(401, "This student account is linked to a different Google account");
  }
  if (!user.googleSubject) {
    user.googleSubject = payload.sub;
    await user.save();
  }

  response.status(200).json(await createSession(user.id, "student", publicUser(user)));
});

authRouter.post("/admin/login", async (request, response) => {
  const input = parseBody(adminLoginSchema, request.body);
  if (!env.ADMIN_ID || !env.ADMIN_PASSWORD) throw new AppError(503, "Admin login is not configured");
  if (!constantTimeStringEqual(input.id, env.ADMIN_ID) || !constantTimeStringEqual(input.password, env.ADMIN_PASSWORD)) {
    throw new AppError(401, "Invalid admin ID or password");
  }

  response.status(200).json(await createSession(
    "admin",
    "admin",
    { id: "admin", role: "admin" },
    randomUUID(),
    getAdminCredentialVersion(),
  ));
});

authRouter.post("/refresh", async (request, response) => {
  const refreshToken = getBearerToken(request);
  let claims;
  try {
    claims = await readRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const now = new Date();
  const session = await RefreshSession.findOne({
    tokenHash: hashToken(refreshToken),
    familyId: claims.familyId,
    subject: claims.subject,
    role: claims.role,
  });
  if (!session) throw new AppError(401, "Refresh session is no longer valid");
  if (session.revokedAt) {
    await RefreshSession.updateMany({ familyId: claims.familyId, revokedAt: null }, { $set: { revokedAt: now } });
    throw new AppError(401, "Refresh token reuse detected; sign in again");
  }
  if (session.expiresAt <= now) throw new AppError(401, "Refresh session has expired");

  const consumedSession = await RefreshSession.findOneAndUpdate(
    { _id: session._id, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now } },
    { returnDocument: "after" },
  );
  if (!consumedSession) {
    await RefreshSession.updateMany({ familyId: claims.familyId, revokedAt: null }, { $set: { revokedAt: now } });
    throw new AppError(401, "Refresh token reuse detected; sign in again");
  }

  if (claims.role === "admin") {
    const credentialVersion = getAdminCredentialVersion();
    if (!credentialVersion || consumedSession.credentialVersion !== credentialVersion) {
      await RefreshSession.updateMany({ familyId: claims.familyId, revokedAt: null }, { $set: { revokedAt: now } });
      throw new AppError(401, "Admin credentials changed; sign in again");
    }
    response.status(200).json(await createSession(
      "admin",
      "admin",
      { id: "admin", role: "admin" },
      claims.familyId,
      credentialVersion,
    ));
    return;
  }

  const user = await User.findOne({ _id: claims.subject, accountType: claims.role });
  if (!user) {
    await RefreshSession.updateMany({ familyId: claims.familyId, revokedAt: null }, { $set: { revokedAt: now } });
    throw new AppError(401, "Account no longer exists");
  }
  if (claims.role === "club" && user.approvalStatus !== "approved") {
    await RefreshSession.updateMany({ familyId: claims.familyId, revokedAt: null }, { $set: { revokedAt: now } });
    throw new AppError(403, "Club registration is pending admin approval");
  }
  response.status(200).json(await createSession(
    user.id,
    claims.role,
    publicUser(user),
    claims.familyId,
  ));
});

authRouter.post("/logout", async (request, response) => {
  const refreshToken = getBearerToken(request);
  let claims;
  try {
    claims = await readRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  await RefreshSession.updateMany(
    { familyId: claims.familyId, subject: claims.subject, role: claims.role, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  response.status(204).end();
});

authRouter.get("/me", authenticate, async (request, response) => {
  const claims = request.auth;
  if (!claims) throw new AppError(401, "Authentication required");
  if (claims.role === "admin") {
    response.status(200).json({ user: { id: "admin", role: "admin" } });
    return;
  }

  const user = await User.findOne({ _id: claims.subject, accountType: claims.role });
  if (!user) throw new AppError(401, "Account no longer exists");
  response.status(200).json({ user: publicUser(user) });
});