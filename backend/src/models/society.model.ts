import { Schema, model } from "mongoose";

export const societyCategories = ["Technical", "Cultural", "Sports", "Social", "Startup", "Academic", "Other"] as const;
export type SocietyCategory = (typeof societyCategories)[number];

export interface SocietyTeamMember {
  _id?: any;
  id?: string;
  name: string;
  role: string;
  batchYear?: number;
  imageUrl?: string;
  linkedinUrl?: string;
}

export interface SocietyRecord {
  ownerId: string;
  name: string;
  foundedYear: number;
  category: SocietyCategory;
  tagline?: string;
  about?: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialLinks: Array<{ platform: string; url: string }>;
  team: SocietyTeamMember[];
  memberCountsByYear: Array<{ batchYear: number; count: number }>;
  tags: string[];
}

const teamMemberSchema = new Schema<SocietyTeamMember>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    batchYear: { type: Number, min: 1900, max: 2200 },
    imageUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
  },
  { _id: true },
);

const societySchema = new Schema<SocietyRecord>(
  {
    ownerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    foundedYear: { type: Number, required: true, min: 1800, max: 2200 },
    category: { type: String, enum: societyCategories, default: "Other" },
    tagline: { type: String, trim: true, maxlength: 180 },
    about: { type: String, trim: true, maxlength: 5000 },
    logoUrl: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    socialLinks: [{ platform: { type: String, trim: true }, url: { type: String, trim: true } }],
    team: { type: [teamMemberSchema], default: [] },
    memberCountsByYear: [{ batchYear: { type: Number, min: 1900, max: 2200 }, count: { type: Number, min: 0 } }],
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

societySchema.index({ name: "text", tagline: "text", about: "text", tags: "text" });

export const Society = model<SocietyRecord>("Society", societySchema);