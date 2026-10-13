import { Schema, model } from "mongoose";

export type ApplicationStatus = "pending" | "shortlisted" | "selected" | "rejected";

export interface ApplicationRecord {
  recruitmentId: string;
  societyId: string;
  studentId: string;
  positionTitle: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  decisionNote?: string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const applicationSchema = new Schema<ApplicationRecord>(
  {
    recruitmentId: { type: String, required: true, index: true },
    societyId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    positionTitle: { type: String, required: true, trim: true, maxlength: 100 },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    resumeUrl: { type: String, trim: true },
    status: { type: String, enum: ["pending", "shortlisted", "selected", "rejected"], default: "pending", index: true },
    decisionNote: { type: String, trim: true, maxlength: 1000 },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

applicationSchema.index({ recruitmentId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1, createdAt: -1 });

export const Application = model<ApplicationRecord>("Application", applicationSchema);