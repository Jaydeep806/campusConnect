import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/app-error.js";
import { authenticate, authorize } from "../middleware/authenticate.js";
import { Application } from "../models/application.model.js";
import { Event } from "../models/event.model.js";
import { Recruitment } from "../models/recruitment.model.js";
import { Society } from "../models/society.model.js";
import { User } from "../models/user.model.js";

export const studentRouter = Router();

studentRouter.use(authenticate, authorize("student"));

const applicationSchema = z.object({
  positionTitle: z.string().trim().min(2).max(100),
  coverLetter: z.string().trim().max(5000).optional(),
  resumeUrl: z.preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val), z.string().trim().url().optional()),
});

function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid request body");
  return result.data;
}

studentRouter.get("/dashboard", async (request, response) => {
  const approvedClubs = await User.find({ accountType: "club", approvalStatus: "approved" }).select("_id").lean();
  const societies = await Society.find({ ownerId: { $in: approvedClubs.map((club) => club._id.toString()) } })
    .sort({ name: 1 })
    .limit(8)
    .lean();
  const societyIds = societies.map((society) => society._id.toString());
  const now = new Date();
  const [upcomingEvents, openRecruitments, recentApplications] = await Promise.all([
    Event.find({ societyId: { $in: societyIds }, status: "published", startsAt: { $gte: now } })
      .sort({ startsAt: 1 }).limit(6).lean(),
    Recruitment.find({ societyId: { $in: societyIds }, status: "open", closesAt: { $gte: now } })
      .sort({ closesAt: 1 }).limit(6).lean(),
    Application.find({ studentId: request.auth!.subject }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const societyById = new Map(societies.map((society) => [society._id.toString(), society]));

  response.status(200).json({
    societies: societies.map((society) => ({
      id: society._id.toString(),
      name: society.name,
      category: society.category,
      tagline: society.tagline,
      logoUrl: society.logoUrl,
      memberCount: society.memberCountsByYear.reduce((total, item) => total + item.count, 0),
    })),
    upcomingEvents: upcomingEvents.map((event) => ({
      ...event,
      society: societyById.get(event.societyId) ?? null,
    })),
    openRecruitments: openRecruitments.map((recruitment) => ({
      ...recruitment,
      society: societyById.get(recruitment.societyId) ?? null,
    })),
    recentApplications,
  });
});

studentRouter.get("/applications", async (request, response) => {
  const applications = await Application.find({ studentId: request.auth!.subject }).sort({ createdAt: -1 }).lean();
  const [recruitments, societies] = await Promise.all([
    Recruitment.find({ _id: { $in: applications.map((application) => application.recruitmentId) } }).select("title positions closesAt status").lean(),
    Society.find({ _id: { $in: applications.map((application) => application.societyId) } }).select("name logoUrl category").lean(),
  ]);
  const recruitmentById = new Map(recruitments.map((recruitment) => [recruitment._id.toString(), recruitment]));
  const societyById = new Map(societies.map((society) => [society._id.toString(), society]));

  response.status(200).json({
    applications: applications.map((application) => ({
      ...application,
      recruitment: recruitmentById.get(application.recruitmentId) ?? null,
      society: societyById.get(application.societyId) ?? null,
    })),
  });
});

studentRouter.post("/recruitments/:recruitmentId/applications", async (request, response) => {
  const { recruitmentId } = request.params;
  if (!isValidObjectId(recruitmentId)) throw new AppError(404, "Recruitment not found");
  const input = parseBody(applicationSchema, request.body);
  const recruitment = await Recruitment.findOne({ _id: recruitmentId, status: "open" });
  if (!recruitment || recruitment.closesAt <= new Date()) {
    throw new AppError(409, "Recruitment is not currently accepting applications");
  }
  const position = recruitment.positions.find((item) => item.title.toLowerCase() === input.positionTitle.toLowerCase());
  if (!position) throw new AppError(400, "Select a position listed in this recruitment");

  const society = await Society.findById(recruitment.societyId).select("ownerId name").lean();
  if (!society) throw new AppError(404, "Society not found");
  const approvedClub = await User.exists({ _id: society.ownerId, accountType: "club", approvalStatus: "approved" });
  if (!approvedClub) throw new AppError(409, "This club is not currently accepting applications");

  try {
    const application = await Application.create({
      ...input,
      recruitmentId: recruitment.id,
      societyId: society._id.toString(),
      studentId: request.auth!.subject,
      positionTitle: position.title,
      status: "pending",
    });
    response.status(201).json({
      message: "Application submitted",
      application,
      ...(recruitment.applicationUrl ? { externalApplicationUrl: recruitment.applicationUrl } : {}),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      throw new AppError(409, "You have already applied to this recruitment");
    }
    throw error;
  }
});