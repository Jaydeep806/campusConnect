import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/app-error.js";
import { authenticate, authorize } from "../middleware/authenticate.js";
import { requireApprovedClub } from "../middleware/require-approved-club.js";
import { Announcement } from "../models/announcement.model.js";
import { Application } from "../models/application.model.js";
import { Event } from "../models/event.model.js";
import { Recruitment } from "../models/recruitment.model.js";
import { Society, societyCategories } from "../models/society.model.js";
import { User } from "../models/user.model.js";

export const clubRouter = Router();

clubRouter.use(authenticate, authorize("club"), requireApprovedClub);

const urlSchema = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }
  return val;
}, z.string().trim().url());
const profilePatchSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  foundedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  category: z.enum(societyCategories).optional(),
  tagline: z.string().trim().max(180).optional(),
  about: z.string().trim().max(5000).optional(),
  logoUrl: urlSchema.optional(),
  bannerUrl: urlSchema.optional(),
  websiteUrl: urlSchema.optional(),
  socialLinks: z.array(z.object({ platform: z.string().trim().min(1).max(40), url: urlSchema })).max(10).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one profile field is required");

const teamSchema = z.object({
  team: z.array(z.object({
    name: z.string().trim().min(2).max(100),
    role: z.string().trim().min(2).max(80),
    batchYear: z.coerce.number().int().min(1900).max(2200).optional(),
    imageUrl: urlSchema.optional(),
    linkedinUrl: urlSchema.optional(),
  })).max(100),
  memberCountsByYear: z.array(z.object({
    batchYear: z.coerce.number().int().min(1900).max(2200),
    count: z.coerce.number().int().min(0).max(100000),
  })).max(10).optional(),
});

const memberSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(80),
  batchYear: z.coerce.number().int().min(1900).max(2200).optional(),
  imageUrl: urlSchema.optional(),
  linkedinUrl: urlSchema.optional(),
});
const memberPatchSchema = memberSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one member field is required");

const eventFieldsSchema = z.object({
  title: z.string().trim().min(4).max(120),
  summary: z.string().trim().min(5).max(280),
  description: z.string().trim().max(10000).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  location: z.string().trim().min(2).max(200),
  mode: z.enum(["in-person", "online", "hybrid"]).default("in-person"),
  registrationUrl: urlSchema.optional(),
  coverImageUrl: urlSchema.optional(),
  status: z.enum(["published", "cancelled"]).default("published"),
});
const eventSchema = eventFieldsSchema.refine((value) => !value.endsAt || value.endsAt >= value.startsAt, {
  message: "Event end time must be after its start time",
  path: ["endsAt"],
});
const eventPatchSchema = eventFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one event field is required");

const recruitmentFieldsSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(5).max(10000).default("Active recruitment drive for new club members."),
  positions: z.array(z.object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(1000).optional(),
    seats: z.coerce.number().int().min(1).max(1000),
  })).min(1).max(30),
  opensAt: z.coerce.date().default(() => new Date()),
  closesAt: z.coerce.date().default(() => new Date(Date.now() + 30 * 86400000)),
  applicationUrl: urlSchema.optional(),
  status: z.enum(["open", "closed"]).default("open"),
});
const recruitmentSchema = recruitmentFieldsSchema.refine((value) => value.closesAt > value.opensAt, {
  message: "Recruitment closing time must be after opening time",
  path: ["closesAt"],
});
const recruitmentPatchSchema = recruitmentFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one recruitment field is required");
const applicationStatusSchema = z.object({
  status: z.enum(["pending", "shortlisted", "selected", "rejected"]),
  decisionNote: z.string().trim().max(1000).optional(),
});
const announcementSchema = z.object({
  title: z.string().trim().min(4).max(160),
  body: z.string().trim().min(5).max(10000),
  status: z.enum(["draft", "published"]).default("published"),
});

function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid request body");
  return result.data;
}

function ownerId(request: Express.Request): string {
  if (!request.clubOwnerId) throw new AppError(403, "Approved club account required");
  return request.clubOwnerId;
}

async function ownedSociety(request: Express.Request) {
  const society = await Society.findOne({ ownerId: ownerId(request) });
  if (!society) throw new AppError(404, "Society profile not found");
  return society;
}

function profileResponse(society: InstanceType<typeof Society>) {
  const { _id, ownerId: _ownerId, __v: _version, ...profile } = society.toObject();
  return { id: _id.toString(), ...profile };
}

function assertObjectId(value: string, message: string): void {
  if (!isValidObjectId(value)) throw new AppError(400, message);
}

clubRouter.get("/dashboard", async (request, response) => {
  const society = await ownedSociety(request);
  const now = new Date();
  const societyId = society.id;
  const [upcomingEvents, openRecruitments, applicationCount, recentApplications] = await Promise.all([
    Event.countDocuments({ societyId, status: "published", startsAt: { $gte: now } }),
    Recruitment.countDocuments({ societyId, status: "open", closesAt: { $gte: now } }),
    Application.countDocuments({ societyId }),
    Application.find({ societyId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const students = await User.find({ _id: { $in: recentApplications.map((application) => application.studentId) } })
    .select("fullName username email batchYear universityRollNumber phoneNumber")
    .lean();
  const studentById = new Map(students.map((student) => [student._id.toString(), student]));

  const teamCount = society.team?.length || 0;
  const byYearCount = society.memberCountsByYear?.reduce((total, item) => total + item.count, 0) || 0;

  response.status(200).json({
    society: profileResponse(society),
    stats: {
      totalMembers: teamCount > 0 ? teamCount : byYearCount,
      openRecruitments,
      upcomingEvents,
      applications: applicationCount,
    },
    recentApplications: recentApplications.map((application) => {
      const student = studentById.get(application.studentId);
      return {
        id: application._id.toString(),
        recruitmentId: application.recruitmentId,
        studentId: application.studentId,
        studentName: student?.fullName || student?.username || "Applicant",
        email: student?.email || "",
        departmentAndYear: student?.batchYear ? `Batch of ${student.batchYear}` : "Undergraduate",
        positionTitle: application.positionTitle,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl,
        status: application.status,
        decisionNote: application.decisionNote,
        createdAt: application.createdAt,
      };
    }),
  });
});

clubRouter.get("/profile", async (request, response) => {
  response.status(200).json({ society: profileResponse(await ownedSociety(request)) });
});

clubRouter.patch("/profile", async (request, response) => {
  const input = parseBody(profilePatchSchema, request.body);
  const society = await ownedSociety(request);
  Object.assign(society, input);
  await society.save();
  const userUpdates: Record<string, string | number> = {};
  if (input.name) userUpdates.clubName = input.name;
  if (input.foundedYear) userUpdates.foundedYear = input.foundedYear;
  if (Object.keys(userUpdates).length > 0) await User.updateOne({ _id: ownerId(request) }, { $set: userUpdates });
  response.status(200).json({ society: profileResponse(society) });
});

clubRouter.put("/team", async (request, response) => {
  const input = parseBody(teamSchema, request.body);
  const society = await ownedSociety(request);
  society.team = input.team;
  if (input.memberCountsByYear) society.memberCountsByYear = input.memberCountsByYear;
  await society.save();
  response.status(200).json({ team: society.team, memberCountsByYear: society.memberCountsByYear });
});

clubRouter.get("/announcements", async (request, response) => {
  const society = await ownedSociety(request);
  const announcements = await Announcement.find({ societyId: society.id }).sort({ createdAt: -1 }).lean();
  response.status(200).json({ announcements });
});

clubRouter.post("/announcements", async (request, response) => {
  const input = parseBody(announcementSchema, request.body);
  const society = await ownedSociety(request);
  const announcement = await Announcement.create({
    ...input,
    societyId: society.id,
    createdBy: ownerId(request),
    publishedAt: input.status === "published" ? new Date() : undefined,
  });
  response.status(201).json({ announcement });
});

clubRouter.get("/events", async (request, response) => {
  const society = await ownedSociety(request);
  const events = await Event.find({ societyId: society.id }).sort({ startsAt: -1 }).lean();
  response.status(200).json({ events });
});

clubRouter.post("/events", async (request, response) => {
  const input = parseBody(eventSchema, request.body);
  const society = await ownedSociety(request);
  const event = await Event.create({ ...input, societyId: society.id, createdBy: ownerId(request) });
  response.status(201).json({ event });
});

clubRouter.patch("/events/:eventId", async (request, response) => {
  assertObjectId(request.params.eventId, "Invalid event ID");
  const input = parseBody(eventPatchSchema, request.body);
  const society = await ownedSociety(request);
  const event = await Event.findOne({ _id: request.params.eventId, societyId: society.id });
  if (!event) throw new AppError(404, "Event not found");
  Object.assign(event, input);
  const valid = eventSchema.safeParse(event.toObject());
  if (!valid.success) throw new AppError(400, valid.error.issues[0]?.message ?? "Invalid event update");
  await event.save();
  response.status(200).json({ event });
});

clubRouter.delete("/events/:eventId", async (request, response) => {
  assertObjectId(request.params.eventId, "Invalid event ID");
  const society = await ownedSociety(request);
  const result = await Event.deleteOne({ _id: request.params.eventId, societyId: society.id });
  if (result.deletedCount === 0) throw new AppError(404, "Event not found");
  response.status(204).end();
});

clubRouter.get("/recruitments", async (request, response) => {
  const society = await ownedSociety(request);
  const recruitments = await Recruitment.find({ societyId: society.id }).sort({ createdAt: -1 }).lean();
  response.status(200).json({ recruitments });
});

clubRouter.post("/recruitments", async (request, response) => {
  const input = parseBody(recruitmentSchema, request.body);
  const society = await ownedSociety(request);
  const recruitment = await Recruitment.create({ ...input, societyId: society.id, createdBy: ownerId(request) });
  response.status(201).json({ recruitment });
});

clubRouter.patch("/recruitments/:recruitmentId", async (request, response) => {
  assertObjectId(request.params.recruitmentId, "Invalid recruitment ID");
  const input = parseBody(recruitmentPatchSchema, request.body);
  const society = await ownedSociety(request);
  const recruitment = await Recruitment.findOne({ _id: request.params.recruitmentId, societyId: society.id });
  if (!recruitment) throw new AppError(404, "Recruitment not found");
  Object.assign(recruitment, input);
  const valid = recruitmentSchema.safeParse(recruitment.toObject());
  if (!valid.success) throw new AppError(400, valid.error.issues[0]?.message ?? "Invalid recruitment update");
  await recruitment.save();
  response.status(200).json({ recruitment });
});

clubRouter.get("/recruitments/:recruitmentId/applications", async (request, response) => {
  assertObjectId(request.params.recruitmentId, "Invalid recruitment ID");
  const society = await ownedSociety(request);
  const recruitment = await Recruitment.findOne({ _id: request.params.recruitmentId, societyId: society.id });
  if (!recruitment) throw new AppError(404, "Recruitment not found");
  const applications = await Application.find({ recruitmentId: recruitment.id }).sort({ createdAt: -1 }).lean();
  const students = await User.find({ _id: { $in: applications.map((application) => application.studentId) } })
    .select("fullName username email batchYear universityRollNumber phoneNumber")
    .lean();
  const studentById = new Map(students.map((student) => [student._id.toString(), student]));
  response.status(200).json({
    applications: applications.map((application) => ({
      ...application,
      student: studentById.get(application.studentId) ?? null,
    })),
  });
});

clubRouter.patch("/applications/:applicationId/status", async (request, response) => {
  assertObjectId(request.params.applicationId, "Invalid application ID");
  const input = parseBody(applicationStatusSchema, request.body);
  const society = await ownedSociety(request);
  const application = await Application.findOneAndUpdate(
    { _id: request.params.applicationId, societyId: society.id },
    { $set: { ...input, reviewedAt: new Date() } },
    { returnDocument: "after", runValidators: true },
  );
  if (!application) throw new AppError(404, "Application not found");
  response.status(200).json({ application });
});

clubRouter.delete("/recruitments/:recruitmentId", async (request, response) => {
  assertObjectId(request.params.recruitmentId, "Invalid recruitment ID");
  const society = await ownedSociety(request);
  const result = await Recruitment.deleteOne({ _id: request.params.recruitmentId, societyId: society.id });
  if (result.deletedCount === 0) throw new AppError(404, "Recruitment drive not found");
  response.status(204).end();
});

clubRouter.get("/applications", async (request, response) => {
  const society = await ownedSociety(request);
  const applications = await Application.find({ societyId: society.id }).sort({ createdAt: -1 }).lean();
  const students = await User.find({ _id: { $in: applications.map((application) => application.studentId) } })
    .select("fullName username email batchYear universityRollNumber phoneNumber")
    .lean();
  const studentById = new Map(students.map((student) => [student._id.toString(), student]));

  response.status(200).json({
    applications: applications.map((application) => {
      const student = studentById.get(application.studentId);
      return {
        id: application._id.toString(),
        recruitmentId: application.recruitmentId,
        studentId: application.studentId,
        studentName: student?.fullName || student?.username || "Applicant",
        email: student?.email || "",
        departmentAndYear: student?.batchYear ? `Batch of ${student.batchYear}` : "Undergraduate",
        positionTitle: application.positionTitle,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl,
        status: application.status,
        decisionNote: application.decisionNote,
        createdAt: application.createdAt,
        reviewedAt: application.reviewedAt,
      };
    }),
  });
});

clubRouter.get("/members", async (request, response) => {
  const society = await ownedSociety(request);
  const members = (society.team || []).map((member: any) => ({
    id: member._id ? member._id.toString() : (member.id || String(Math.random())),
    name: member.name,
    role: member.role,
    batchYear: member.batchYear,
    imageUrl: member.imageUrl,
    linkedinUrl: member.linkedinUrl,
  }));
  response.status(200).json({ members });
});

clubRouter.post("/members", async (request, response) => {
  const input = parseBody(memberSchema, request.body);
  const society = await ownedSociety(request);
  society.team.push(input as any);
  await society.save();
  const added = society.team[society.team.length - 1] as any;
  response.status(201).json({
    member: {
      id: added._id ? added._id.toString() : added.id,
      name: added.name,
      role: added.role,
      batchYear: added.batchYear,
      imageUrl: added.imageUrl,
      linkedinUrl: added.linkedinUrl,
    },
  });
});

clubRouter.patch("/members/:memberId", async (request, response) => {
  const memberId = request.params.memberId;
  const input = parseBody(memberPatchSchema, request.body);
  const society = await ownedSociety(request);
  const member = society.team.find((m: any) => (m._id ? m._id.toString() : m.id) === memberId);
  if (!member) throw new AppError(404, "Member not found");
  Object.assign(member, input);
  await society.save();
  response.status(200).json({
    member: {
      id: member._id ? member._id.toString() : member.id,
      name: member.name,
      role: member.role,
      batchYear: member.batchYear,
      imageUrl: member.imageUrl,
      linkedinUrl: member.linkedinUrl,
    },
  });
});

clubRouter.delete("/members/:memberId", async (request, response) => {
  const memberId = request.params.memberId;
  const society = await ownedSociety(request);
  const initialLength = society.team.length;
  society.team = (society.team as any).filter((m: any) => (m._id ? m._id.toString() : m.id) !== memberId);
  if (society.team.length === initialLength) throw new AppError(404, "Member not found");
  await society.save();
  response.status(204).end();
});