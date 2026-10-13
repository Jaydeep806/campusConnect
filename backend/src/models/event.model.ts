import { Schema, model } from "mongoose";

export type EventStatus = "published" | "cancelled";

export interface EventRecord {
  societyId: string;
  createdBy: string;
  title: string;
  summary: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  location: string;
  mode: "in-person" | "online" | "hybrid";
  registrationUrl?: string;
  coverImageUrl?: string;
  status: EventStatus;
}

const eventSchema = new Schema<EventRecord>(
  {
    societyId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, required: true, trim: true, maxlength: 280 },
    description: { type: String, trim: true, maxlength: 10000 },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    mode: { type: String, enum: ["in-person", "online", "hybrid"], default: "in-person" },
    registrationUrl: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    status: { type: String, enum: ["published", "cancelled"], default: "published", index: true },
  },
  { timestamps: true },
);

eventSchema.index({ societyId: 1, startsAt: 1, status: 1 });

export const Event = model<EventRecord>("Event", eventSchema);