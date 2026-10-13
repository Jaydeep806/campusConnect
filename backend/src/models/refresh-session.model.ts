import { Schema, model } from "mongoose";
import type { AuthRole } from "../auth/tokens.js";

export interface RefreshSessionRecord {
  subject: string;
  role: AuthRole;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  credentialVersion?: string;
}

const refreshSessionSchema = new Schema<RefreshSessionRecord>(
  {
    subject: { type: String, required: true },
    role: { type: String, enum: ["student", "club", "admin"], required: true },
    familyId: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    credentialVersion: { type: String },
  },
  { timestamps: true },
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshSessionSchema.index({ familyId: 1, revokedAt: 1 });

export const RefreshSession = model<RefreshSessionRecord>("RefreshSession", refreshSessionSchema);