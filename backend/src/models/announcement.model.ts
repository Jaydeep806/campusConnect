import { Schema, model } from "mongoose";

export interface AnnouncementRecord {
  createdBy: string;
  societyId?: string;
  title: string;
  body: string;
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const announcementSchema = new Schema<AnnouncementRecord>(
  {
    createdBy: { type: String, required: true, index: true },
    societyId: { type: String, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ societyId: 1, status: 1, publishedAt: -1 });

export const Announcement = model<AnnouncementRecord>("Announcement", announcementSchema);