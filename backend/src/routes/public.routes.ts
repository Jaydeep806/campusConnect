import { Router } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/app-error.js";
import { Announcement, type AnnouncementRecord } from "../models/announcement.model.js";
import { Event } from "../models/event.model.js";
import { Recruitment } from "../models/recruitment.model.js";
import { Society, societyCategories } from "../models/society.model.js";
import { User } from "../models/user.model.js";

export const publicRouter = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
const directorySchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  category: z.enum(societyCategories).optional(),
});
const eventListSchema = paginationSchema.extend({
  period: z.enum(["upcoming", "past", "all"]).default("upcoming"),
});

function parseQuery<T extends z.ZodType>(schema: T, query: unknown): z.output<T> {
  const result = schema.safeParse(query);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid query parameters");
  return result.data;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function approvedSocieties(): Promise<Awaited<ReturnType<typeof Society.find>>> {
  const clubs = await User.find({ accountType: "club", approvalStatus: "approved" }).select("_id").lean();
  if (clubs.length === 0) return [];
  return Society.find({ ownerId: { $in: clubs.map((club) => club._id.toString()) } }).sort({ name: 1 });
}

async function publicSociety(societyId: string) {
  if (!isValidObjectId(societyId)) throw new AppError(404, "Society not found");
  const society = await Society.findById(societyId).lean();
  if (!society) throw new AppError(404, "Society not found");
  const approvedClub = await User.exists({
    _id: society.ownerId,
    accountType: "club",
    approvalStatus: "approved",
  });
  if (!approvedClub) throw new AppError(404, "Society not found");
  return society;
}

async function eventResponse<T extends { societyId: string }>(event: T) {
  const societyId = event.societyId;
  const society = await Society.findById(societyId).select("name category logoUrl").lean();
  return { ...event, society };
}

publicRouter.get("/societies", async (request, response) => {
  const { page, limit, q, category } = parseQuery(directorySchema, request.query);
  const clubs = await User.find({ accountType: "club", approvalStatus: "approved" }).select("_id").lean();
  const filters: Record<string, unknown> = {
    ownerId: { $in: clubs.map((club) => club._id.toString()) },
  };
  if (category) filters.category = category;
  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filters.$or = [{ name: search }, { tagline: search }, { about: search }, { tags: search }];
  }

  const now = new Date();
  const [societies, total, openRecruitments] = await Promise.all([
    Society.find(filters).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Society.countDocuments(filters),
    Recruitment.find({ status: "open", closesAt: { $gte: now } }).select("societyId").lean(),
  ]);

  const activeRecruitmentSet = new Set(openRecruitments.map((r) => r.societyId));

  response.status(200).json({
    page,
    limit,
    total,
    societies: societies.map((society) => ({
      id: society._id.toString(),
      name: society.name,
      category: society.category,
      tagline: society.tagline,
      logoUrl: society.logoUrl,
      bannerUrl: society.bannerUrl,
      tags: society.tags,
      memberCount: society.memberCountsByYear.reduce((totalMembers, entry) => totalMembers + entry.count, 0),
      hasOpenRecruitment: activeRecruitmentSet.has(society._id.toString()),
    })),
  });
});

publicRouter.get("/recruitments", async (_request, response) => {
  const societies = await approvedSocieties();
  const societyIds = societies.map((s) => s._id.toString());
  const now = new Date();
  const recruitments = await Recruitment.find({
    societyId: { $in: societyIds },
    status: "open",
    closesAt: { $gte: now },
  }).sort({ closesAt: 1 }).lean();
  const societyById = new Map(societies.map((s) => [s._id.toString(), s]));

  response.status(200).json({
    recruitments: recruitments.map((r) => {
      const society = societyById.get(r.societyId);
      return {
        id: r._id.toString(),
        societyId: r.societyId,
        societyName: society?.name || "Campus Club",
        societyLogoText: society?.name ? society.name.slice(0, 3).toUpperCase() : "CC",
        societyLogoUrl: society?.logoUrl,
        title: r.title,
        description: r.description,
        positions: r.positions,
        opensAt: r.opensAt,
        closesAt: r.closesAt,
        lastDate: new Date(r.closesAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        googleFormUrl: r.applicationUrl,
        mode: r.applicationUrl ? "Google Form" : "Internal Portal",
        status: r.status,
      };
    }),
  });
});

publicRouter.get("/societies/:societyId", async (request, response) => {
  const society = await publicSociety(request.params.societyId);
  const now = new Date();
  const [upcomingEvents, openRecruitments, latestRecruitment, activeRecruitments] = await Promise.all([
    Event.countDocuments({ societyId: society._id.toString(), status: "published", startsAt: { $gte: now } }),
    Recruitment.countDocuments({ societyId: society._id.toString(), status: "open", closesAt: { $gte: now } }),
    Recruitment.findOne({ societyId: society._id.toString(), status: "open", closesAt: { $gte: now } }).sort({ closesAt: 1 }).lean(),
    Recruitment.find({ societyId: society._id.toString(), status: "open", closesAt: { $gte: now } }).sort({ closesAt: 1 }).lean(),
  ]);

  response.status(200).json({
    society: {
      id: society._id.toString(),
      name: society.name,
      foundedYear: society.foundedYear,
      category: society.category,
      tagline: society.tagline,
      about: society.about,
      logoUrl: society.logoUrl,
      bannerUrl: society.bannerUrl,
      websiteUrl: society.websiteUrl,
      socialLinks: society.socialLinks,
      team: society.team,
      memberCountsByYear: society.memberCountsByYear,
      tags: society.tags,
      stats: {
        memberCount: society.memberCountsByYear.reduce((total, entry) => total + entry.count, 0),
        upcomingEvents,
        openRecruitments,
      },
      recruitment: latestRecruitment ? {
        id: latestRecruitment._id.toString(),
        isOpen: latestRecruitment.status === "open",
        title: latestRecruitment.title,
        description: latestRecruitment.description,
        positions: latestRecruitment.positions,
        opensAt: latestRecruitment.opensAt,
        closesAt: latestRecruitment.closesAt,
        lastDate: new Date(latestRecruitment.closesAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        mode: latestRecruitment.applicationUrl ? "Google Form" : "Internal Portal",
        googleFormUrl: latestRecruitment.applicationUrl,
      } : null,
      recruitments: activeRecruitments.map((r) => ({
        id: r._id.toString(),
        title: r.title,
        description: r.description,
        positions: r.positions,
        closesAt: r.closesAt,
        applicationUrl: r.applicationUrl,
        status: r.status,
      })),
    },
  });
});

publicRouter.get("/societies/:societyId/team", async (request, response) => {
  const society = await publicSociety(request.params.societyId);
  response.status(200).json({ societyId: society._id.toString(), team: society.team });
});

publicRouter.get("/societies/:societyId/recruitments", async (request, response) => {
  const society = await publicSociety(request.params.societyId);
  const recruitments = await Recruitment.find({
    societyId: society._id.toString(),
    status: "open",
    closesAt: { $gte: new Date() },
  }).sort({ closesAt: 1 }).lean();
  response.status(200).json({ recruitments });
});

publicRouter.get("/societies/:societyId/events", async (request, response) => {
  const society = await publicSociety(request.params.societyId);
  const { page, limit } = parseQuery(paginationSchema, request.query);
  const [events, total] = await Promise.all([
    Event.find({ societyId: society._id.toString(), status: "published" })
      .sort({ startsAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments({ societyId: society._id.toString(), status: "published" }),
  ]);
  response.status(200).json({ page, limit, total, events });
});

publicRouter.get("/events", async (request, response) => {
  const { page, limit, period } = parseQuery(eventListSchema, request.query);
  const societies = await approvedSocieties();
  const societyIds = societies.map((society) => society.id);
  const dateFilter = period === "upcoming"
    ? { $gte: new Date() }
    : period === "past"
      ? { $lt: new Date() }
      : undefined;
  const filters: Record<string, unknown> = { societyId: { $in: societyIds }, status: "published" };
  if (dateFilter) filters.startsAt = dateFilter;

  const [events, total] = await Promise.all([
    Event.find(filters).sort({ startsAt: period === "past" ? -1 : 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(filters),
  ]);
  const societyById = new Map(societies.map((society) => [society.id, society]));
  response.status(200).json({
    page,
    limit,
    total,
    events: events.map((event) => {
      const society = societyById.get(event.societyId);
      return {
        ...event,
        society: society && { id: society.id, name: society.name, category: society.category, logoUrl: society.logoUrl },
      };
    }),
  });
});

publicRouter.get("/events/:eventId", async (request, response) => {
  if (!isValidObjectId(request.params.eventId)) throw new AppError(404, "Event not found");
  const event = await Event.findOne({ _id: request.params.eventId, status: "published" }).lean();
  if (!event) throw new AppError(404, "Event not found");
  await publicSociety(event.societyId);
  response.status(200).json({ event: await eventResponse(event) });
});

publicRouter.get("/announcements", async (request, response) => {
  const { page, limit } = parseQuery(paginationSchema, request.query);
  const societies = await approvedSocieties();
  const societyIds = societies.map((society) => society.id);
  const filters: QueryFilter<AnnouncementRecord> = {
    status: "published",
    publishedAt: { $lte: new Date() },
    $or: [{ societyId: { $exists: false } }, { societyId: null }, { societyId: { $in: societyIds } }],
  };
  const [announcements, total] = await Promise.all([
    Announcement.find(filters).sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Announcement.countDocuments(filters),
  ]);
  const societyById = new Map(societies.map((society) => [society.id, society]));
  response.status(200).json({
    page,
    limit,
    total,
    announcements: announcements.map((announcement) => ({
      ...announcement,
      society: announcement.societyId ? societyById.get(announcement.societyId) ?? null : null,
    })),
  });
});

publicRouter.get("/faqs", (_request, response) => {
  response.status(200).json({
    faqs: [
      { id: "browse-societies", question: "How do I find a society?", answer: "Browse societies by category or search by name, topic, or tag." },
      { id: "join-society", question: "How do I contact a society?", answer: "Open its profile to view its website and social links." },
      { id: "club-approval", question: "Why is my club login pending?", answer: "New club registrations must be reviewed and approved by an administrator before login is enabled." },
      { id: "application-status", question: "Where can I check my recruitment application?", answer: "Sign in as a student and open your applications page to see its current status." },
    ],
  });
});