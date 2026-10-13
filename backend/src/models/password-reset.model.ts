import { Schema, model } from "mongoose";
import type { AccountType } from "./user.model.js";

export interface PasswordResetRecord {
  userId: string;
  accountType: AccountType;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const passwordResetSchema = new Schema<PasswordResetRecord>(
  {
    userId: { type: String, required: true },
    accountType: { type: String, enum: ["student", "club"], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true },
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetSchema.index({ userId: 1, accountType: 1, usedAt: 1 });

export const PasswordReset = model<PasswordResetRecord>("PasswordReset", passwordResetSchema);