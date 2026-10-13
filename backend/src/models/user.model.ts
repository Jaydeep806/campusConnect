import { Schema, model } from "mongoose";

export type AccountType = "student" | "club";
export type ClubApprovalStatus = "pending" | "approved";

export interface UserRecord {
  accountType: AccountType;
  email: string;
  passwordHash: string;
  username?: string;
  fullName?: string;
  batchYear?: number;
  universityRollNumber?: string;
  phoneNumber?: string;
  clubName?: string;
  foundedYear?: number;
  approvalStatus?: ClubApprovalStatus;
  approvedAt?: Date;
  approvedBy?: string;
  googleSubject?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    accountType: { type: String, enum: ["student", "club"], required: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    fullName: { type: String, trim: true },
    batchYear: { type: Number, min: 1900, max: 2200 },
    universityRollNumber: { type: String, trim: true, unique: true, sparse: true },
    phoneNumber: { type: String, trim: true },
    clubName: { type: String, trim: true },
    foundedYear: { type: Number, min: 1800, max: 2200 },
    approvalStatus: { type: String, enum: ["pending", "approved"] },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    googleSubject: { type: String, sparse: true, unique: true },
  },
  { timestamps: true },
);

export const User = model<UserRecord>("User", userSchema);