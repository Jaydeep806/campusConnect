import { Schema, model } from "mongoose";

export interface RecruitmentPosition {
  title: string;
  description?: string;
  seats: number;
}

export interface RecruitmentRecord {
  societyId: string;
  createdBy: string;
  title: string;
  description: string;
  positions: RecruitmentPosition[];
  opensAt: Date;
  closesAt: Date;
  applicationUrl?: string;
  status: "open" | "closed";
}

const positionSchema = new Schema<RecruitmentPosition>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    seats: { type: Number, required: true, min: 1, max: 1000 },
  },
  { _id: false },
);

const recruitmentSchema = new Schema<RecruitmentRecord>(
  {
    societyId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    positions: { type: [positionSchema], required: true, validate: [(positions: RecruitmentPosition[]) => positions.length > 0, "At least one position is required"] },
    opensAt: { type: Date, required: true },
    closesAt: { type: Date, required: true, index: true },
    applicationUrl: { type: String, trim: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
  },
  { timestamps: true },
);

recruitmentSchema.index({ societyId: 1, status: 1, closesAt: 1 });

export const Recruitment = model<RecruitmentRecord>("Recruitment", recruitmentSchema);