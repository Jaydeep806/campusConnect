import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";
import type { AccountType } from "../models/user.model.js";

export type AuthRole = AccountType | "admin";

export interface AuthClaims {
  subject: string;
  role: AuthRole;
}

export interface RefreshClaims extends AuthClaims {
  familyId: string;
  tokenId: string;
}

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const jwtKey = new TextEncoder().encode(env.JWT_SECRET);
const issuer = "campus-connect-api";
const audience = "campus-connect";

export async function createAccessToken(subject: string, role: AuthRole): Promise<string> {
  return new SignJWT({ role, tokenUse: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(jwtKey);
}

export async function readAccessToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, jwtKey, { issuer, audience });
  const role = payload.role;
  if (payload.tokenUse !== "access" || typeof payload.sub !== "string" || (role !== "student" && role !== "club" && role !== "admin")) {
    throw new Error("Invalid access token claims");
  }
  return { subject: payload.sub, role };
}

export async function createRefreshToken(subject: string, role: AuthRole, familyId: string): Promise<string> {
  return new SignJWT({ role, tokenUse: "refresh", familyId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SECONDS}s`)
    .sign(jwtKey);
}

export async function readRefreshToken(token: string): Promise<RefreshClaims> {
  const { payload } = await jwtVerify(token, jwtKey, { issuer, audience });
  const role = payload.role;
  if (
    payload.tokenUse !== "refresh" ||
    typeof payload.sub !== "string" ||
    typeof payload.familyId !== "string" ||
    typeof payload.jti !== "string" ||
    (role !== "student" && role !== "club" && role !== "admin")
  ) {
    throw new Error("Invalid refresh token claims");
  }
  return { subject: payload.sub, role, familyId: payload.familyId, tokenId: payload.jti };
}