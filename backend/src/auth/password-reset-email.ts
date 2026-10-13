import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : undefined;

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!transporter || !env.SMTP_FROM) throw new Error("Password reset email is not configured");

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Reset your CampusConnect password",
    text: [
      "We received a request to reset your CampusConnect password.",
      "Use the link below within 15 minutes. It can only be used once.",
      "",
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });
}