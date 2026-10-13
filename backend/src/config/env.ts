import "dotenv/config";
import { z } from "zod";

const optionalEnvironmentString = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);
const optionalEnvironmentUrl = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.url().optional(),
);
const optionalAdminPassword = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().min(8).max(128).optional(),
);

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1).default(
    process.env.NODE_ENV === "production" ? "" : "mongodb://127.0.0.1:27017/campus_connect",
  ),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  JWT_SECRET: z.string().min(32).default(
    process.env.NODE_ENV === "production" ? "" : "local-only-change-this-secret-before-deployment",
  ),
  GOOGLE_CLIENT_ID: optionalEnvironmentString,
  ADMIN_ID: optionalEnvironmentString.pipe(z.string().max(100).optional()),
  ADMIN_PASSWORD: optionalAdminPassword,
  SMTP_URL: optionalEnvironmentUrl,
  SMTP_FROM: optionalEnvironmentString,
  PASSWORD_RESET_URL: optionalEnvironmentUrl,
}).superRefine((values, context) => {
  if (Boolean(values.ADMIN_ID) !== Boolean(values.ADMIN_PASSWORD)) {
    context.addIssue({
      code: "custom",
      message: "ADMIN_ID and ADMIN_PASSWORD must be configured together",
      path: ["ADMIN_ID"],
    });
  }
  if (Boolean(values.SMTP_URL) !== Boolean(values.SMTP_FROM)) {
    context.addIssue({
      code: "custom",
      message: "SMTP_URL and SMTP_FROM must be configured together",
      path: ["SMTP_URL"],
    });
  }
  if (values.NODE_ENV === "production") {
    if (!values.SMTP_URL || !values.SMTP_FROM) {
      context.addIssue({
        code: "custom",
        message: "SMTP_URL and SMTP_FROM are required in production for password reset delivery",
        path: ["SMTP_URL"],
      });
    }
    if (!values.PASSWORD_RESET_URL) {
      context.addIssue({
        code: "custom",
        message: "PASSWORD_RESET_URL is required in production",
        path: ["PASSWORD_RESET_URL"],
      });
    } else if (new URL(values.PASSWORD_RESET_URL).protocol !== "https:") {
      context.addIssue({
        code: "custom",
        message: "PASSWORD_RESET_URL must use HTTPS in production",
        path: ["PASSWORD_RESET_URL"],
      });
    }
  }
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:", z.treeifyError(result.error));
  process.exit(1);
}

export const env = result.data;
export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
export const passwordResetUrl = env.PASSWORD_RESET_URL ?? "http://localhost:3000/reset-password";