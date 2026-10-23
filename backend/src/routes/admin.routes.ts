import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/app-error.js";
import { authenticate, authorize } from "../middleware/authenticate.js";
import { Announcement } from "../models/announcement.model.js";
import { Application } from "../models/application.model.js";
import { Event } from "../models/event.model.js";
import { Recruitment } from "../models/recruitment.model.js";
import { Society, societyCategories } from "../models/society.model.js";
import { User } from "../models/user.model.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("admin"));

function assertObjectId(value: string, message: string): void {
  if (!isValidObjectId(value)) throw new AppError(400, message);
}

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

const announcementSchema = z.object({
  title: z.string().trim().min(4).max(160),
  body: z.string().trim().min(5).max(10000),
  status: z.enum(["draft", "published"]).default("published"),
});

const announcementPatchSchema = z.object({
  title: z.string().trim().min(4).max(160).optional(),
  body: z.string().trim().min(5).max(10000).optional(),
  status: z.enum(["draft", "published"]).optional(),
}).refine((val) => Object.keys(val).length > 0, "At least one field is required");

const eventFieldsSchema = z.object({
  societyId: z.string().optional(),
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

const eventPatchSchema = eventFieldsSchema.partial().refine(
  (val) => Object.keys(val).length > 0,
  "At least one event field is required"
);

const recruitmentFieldsSchema = z.object({
  societyId: z.string().optional(),
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(5).max(10000).default("Active recruitment drive."),
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

const recruitmentPatchSchema = recruitmentFieldsSchema.partial().refine(
  (val) => Object.keys(val).length > 0,
  "At least one recruitment field is required"
);

// --- STATS OVERVIEW ---
adminRouter.get("/stats", async (_request, response) => {
  const [totalClubs, pendingClubs, approvedClubs, totalEvents, totalRecruitments, totalAnnouncements, totalApplications] =
    await Promise.all([
      User.countDocuments({ accountType: "club" }),
      User.countDocuments({ accountType: "club", $or: [{ approvalStatus: "pending" }, { approvalStatus: { $exists: false } }] }),
      User.countDocuments({ accountType: "club", approvalStatus: "approved" }),
      Event.countDocuments(),
      Recruitment.countDocuments(),
      Announcement.countDocuments(),
      Application.countDocuments(),
    ]);

  response.status(200).json({
    stats: {
      totalClubs,
      pendingClubs,
      approvedClubs,
      totalEvents,
      totalRecruitments,
      totalAnnouncements,
      totalApplications,
    },
  });
});

// --- CLUBS MANAGEMENT ---
adminRouter.get("/clubs", async (_request, response) => {
  const [clubs, societies, events, recruitments] = await Promise.all([
    User.find({ accountType: "club" })
      .select("email clubName foundedYear approvalStatus createdAt approvedAt")
      .sort({ createdAt: -1 })
      .lean(),
    Society.find().lean(),
    Event.find().select("societyId").lean(),
    Recruitment.find().select("societyId").lean(),
  ]);

  const societyByOwner = new Map(societies.map((s) => [s.ownerId, s]));
  const societyById = new Map(societies.map((s) => [s._id.toString(), s]));
  const eventCountBySociety = new Map<string, number>();
  for (const e of events) {
    eventCountBySociety.set(e.societyId, (eventCountBySociety.get(e.societyId) || 0) + 1);
  }
  const recruitmentCountBySociety = new Map<string, number>();
  for (const r of recruitments) {
    recruitmentCountBySociety.set(r.societyId, (recruitmentCountBySociety.get(r.societyId) || 0) + 1);
  }

  response.status(200).json({
    clubs: clubs.map((club) => {
      const society = societyByOwner.get(club._id.toString());
      const socId = society?._id.toString();
      return {
        id: club._id.toString(),
        email: club.email,
        clubName: club.clubName,
        foundedYear: club.foundedYear,
        approvalStatus: club.approvalStatus ?? "pending",
        createdAt: club.createdAt,
        approvedAt: club.approvedAt,
        society: society
          ? {
              id: socId,
              name: society.name,
              category: society.category,
              tagline: society.tagline,
              about: society.about,
              logoUrl: society.logoUrl,
              bannerUrl: society.bannerUrl,
              websiteUrl: society.websiteUrl,
              socialLinks: society.socialLinks,
            }
          : null,
        stats: {
          eventsCount: socId ? (eventCountBySociety.get(socId) || 0) : 0,
          recruitmentsCount: socId ? (recruitmentCountBySociety.get(socId) || 0) : 0,
        },
      };
    }),
  });
});

adminRouter.get("/clubs/pending", async (_request, response) => {
  const clubs = await User.find({
    accountType: "club",
    $or: [
      { approvalStatus: "pending" },
      { approvalStatus: { $exists: false } },
    ],
  })
    .select("email clubName foundedYear approvalStatus createdAt")
    .sort({ createdAt: 1 })
    .lean();

  response.status(200).json({
    clubs: clubs.map((club) => ({
      id: club._id.toString(),
      email: club.email,
      clubName: club.clubName,
      foundedYear: club.foundedYear,
      approvalStatus: club.approvalStatus ?? "pending",
      createdAt: club.createdAt,
    })),
  });
});

adminRouter.patch("/clubs/:clubId/approve", async (request, response) => {
  const { clubId } = request.params;
  assertObjectId(clubId, "Invalid club ID");

  const club = await User.findOneAndUpdate(
    {
      _id: clubId,
      accountType: "club",
      $or: [
        { approvalStatus: "pending" },
        { approvalStatus: { $exists: false } },
      ],
    },
    {
      $set: {
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: request.auth?.subject,
      },
    },
    { returnDocument: "after", runValidators: true },
  );

  if (!club) {
    const existingClub = await User.findOne({ _id: clubId, accountType: "club" }).select("approvalStatus");
    if (!existingClub) throw new AppError(404, "Club registration not found");
    throw new AppError(409, "Club is not pending approval");
  }

  const society = await Society.findOneAndUpdate(
    { ownerId: club.id },
    { $setOnInsert: { ownerId: club.id, name: club.clubName, foundedYear: club.foundedYear, category: "Other" } },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  response.status(200).json({
    message: "Club approved; it can now log in",
    societyId: society.id,
    club: {
      id: club.id,
      email: club.email,
      clubName: club.clubName,
      foundedYear: club.foundedYear,
      approvalStatus: club.approvalStatus,
      approvedAt: club.approvedAt,
    },
  });
});

adminRouter.patch("/clubs/:clubId/status", async (request, response) => {
  const { clubId } = request.params;
  assertObjectId(clubId, "Invalid club ID");
  const { status } = request.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new AppError(400, "Invalid status. Must be approved, rejected, or pending");
  }

  const club = await User.findOneAndUpdate(
    { _id: clubId, accountType: "club" },
    { $set: { approvalStatus: status } },
    { returnDocument: "after" }
  );
  if (!club) throw new AppError(404, "Club not found");

  if (status === "approved") {
    await Society.findOneAndUpdate(
      { ownerId: club.id },
      { $setOnInsert: { ownerId: club.id, name: club.clubName, foundedYear: club.foundedYear, category: "Other" } },
      { upsert: true }
    );
  }

  response.status(200).json({ club });
});

adminRouter.patch("/clubs/:clubId/profile", async (request, response) => {
  const { clubId } = request.params;
  assertObjectId(clubId, "Invalid club ID");

  const club = await User.findOne({ _id: clubId, accountType: "club" });
  if (!club) throw new AppError(404, "Club user not found");

  const { clubName, foundedYear, category, tagline, about, logoUrl, bannerUrl, websiteUrl } = request.body;

  if (clubName) club.clubName = clubName.trim();
  if (foundedYear) club.foundedYear = Number(foundedYear);
  await club.save();

  let society = await Society.findOne({ ownerId: club.id });
  if (!society) {
    society = await Society.create({
      ownerId: club.id,
      name: club.clubName || "Club",
      foundedYear: club.foundedYear || 2024,
      category: category && societyCategories.includes(category) ? category : "Other",
      tagline: tagline || "",
      about: about || "",
      logoUrl,
      bannerUrl,
      websiteUrl,
    });
  } else {
    if (clubName) society.name = clubName.trim();
    if (foundedYear) society.foundedYear = Number(foundedYear);
    if (category && societyCategories.includes(category)) society.category = category;
    if (tagline !== undefined) society.tagline = tagline;
    if (about !== undefined) society.about = about;
    if (logoUrl !== undefined) society.logoUrl = logoUrl;
    if (bannerUrl !== undefined) society.bannerUrl = bannerUrl;
    if (websiteUrl !== undefined) society.websiteUrl = websiteUrl;
    await society.save();
  }

  response.status(200).json({ club, society });
});

adminRouter.delete("/clubs/:clubId", async (request, response) => {
  const { clubId } = request.params;
  assertObjectId(clubId, "Invalid club ID");

  const club = await User.findOne({ _id: clubId, accountType: "club" });
  if (!club) throw new AppError(404, "Club not found");

  const society = await Society.findOne({ ownerId: club.id });
  if (society) {
    const socId = society._id.toString();
    await Promise.all([
      Event.deleteMany({ societyId: socId }),
      Recruitment.deleteMany({ societyId: socId }),
      Application.deleteMany({ societyId: socId }),
      Society.deleteOne({ _id: society._id }),
    ]);
  }

  await User.deleteOne({ _id: club._id });
  response.status(200).json({ message: "Club and all associated records deleted successfully" });
});

// --- EVENTS MANAGEMENT (ADMIN FULL ACCESS) ---
adminRouter.get("/events", async (_request, response) => {
  const [events, societies] = await Promise.all([
    Event.find().sort({ startsAt: -1 }).lean(),
    Society.find().lean(),
  ]);

  const societyById = new Map(societies.map((s) => [s._id.toString(), s]));

  response.status(200).json({
    events: events.map((e) => {
      const society = societyById.get(e.societyId);
      return {
        id: e._id.toString(),
        _id: e._id.toString(),
        societyId: e.societyId,
        societyName: society?.name || "Campus Community",
        societyLogoText: society?.name ? society.name.slice(0, 3).toUpperCase() : "CC",
        title: e.title,
        summary: e.summary,
        description: e.description || e.summary,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        dateTime: e.startsAt
          ? new Date(e.startsAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Upcoming",
        location: e.location,
        mode: e.mode,
        registrationUrl: e.registrationUrl,
        coverImageUrl: e.coverImageUrl,
        status: e.status,
      };
    }),
  });
});

adminRouter.post("/events", async (request, response) => {
  const result = eventFieldsSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid event payload");

  let societyId = result.data.societyId;
  if (!societyId) {
    const firstSoc = await Society.findOne().lean();
    societyId = firstSoc ? firstSoc._id.toString() : request.auth!.subject;
  }

  const event = await Event.create({
    ...result.data,
    societyId,
    createdBy: request.auth!.subject,
  });

  response.status(201).json({ event });
});

adminRouter.patch("/events/:eventId", async (request, response) => {
  const { eventId } = request.params;
  assertObjectId(eventId, "Invalid event ID");

  const result = eventPatchSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid event update payload");

  const event = await Event.findById(eventId);
  if (!event) throw new AppError(404, "Event not found");

  Object.assign(event, result.data);
  await event.save();

  response.status(200).json({ event });
});

adminRouter.delete("/events/:eventId", async (request, response) => {
  const { eventId } = request.params;
  assertObjectId(eventId, "Invalid event ID");

  const result = await Event.deleteOne({ _id: eventId });
  if (result.deletedCount === 0) throw new AppError(404, "Event not found");

  response.status(200).json({ message: "Event deleted successfully" });
});

// --- ANNOUNCEMENTS MANAGEMENT (ADMIN FULL ACCESS) ---
adminRouter.get("/announcements", async (_request, response) => {
  const [announcements, societies] = await Promise.all([
    Announcement.find().sort({ createdAt: -1 }).lean(),
    Society.find().lean(),
  ]);

  const societyById = new Map(societies.map((s) => [s._id.toString(), s]));

  response.status(200).json({
    announcements: announcements.map((a) => {
      const society = a.societyId ? societyById.get(a.societyId) : null;
      return {
        id: a._id.toString(),
        _id: a._id.toString(),
        title: a.title,
        body: a.body,
        societyId: a.societyId,
        societyName: society?.name || (a.societyId ? "Club Advisory" : "Campus Administration"),
        status: a.status,
        isGlobal: !a.societyId,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
      };
    }),
  });
});

adminRouter.post("/announcements", async (request, response) => {
  const result = announcementSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid announcement");

  const announcement = await Announcement.create({
    ...result.data,
    createdBy: request.auth!.subject,
    publishedAt: result.data.status === "published" ? new Date() : undefined,
  });
  response.status(201).json({ announcement });
});

adminRouter.patch("/announcements/:announcementId", async (request, response) => {
  const { announcementId } = request.params;
  assertObjectId(announcementId, "Invalid announcement ID");

  const result = announcementPatchSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid announcement update");

  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw new AppError(404, "Announcement not found");

  Object.assign(announcement, result.data);
  if (result.data.status === "published" && !announcement.publishedAt) {
    announcement.publishedAt = new Date();
  }
  await announcement.save();

  response.status(200).json({ announcement });
});

adminRouter.delete("/announcements/:announcementId", async (request, response) => {
  const { announcementId } = request.params;
  assertObjectId(announcementId, "Invalid announcement ID");

  const result = await Announcement.deleteOne({ _id: announcementId });
  if (result.deletedCount === 0) throw new AppError(404, "Announcement not found");

  response.status(200).json({ message: "Announcement deleted successfully" });
});

// --- RECRUITMENT DRIVES MANAGEMENT (ADMIN FULL ACCESS) ---
adminRouter.get("/recruitments", async (_request, response) => {
  const [recruitments, societies] = await Promise.all([
    Recruitment.find().sort({ createdAt: -1 }).lean(),
    Society.find().lean(),
  ]);

  const societyById = new Map(societies.map((s) => [s._id.toString(), s]));

  response.status(200).json({
    recruitments: recruitments.map((r) => {
      const society = societyById.get(r.societyId);
      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        societyId: r.societyId,
        societyName: society?.name || "Campus Club",
        societyLogoText: society?.name ? society.name.slice(0, 3).toUpperCase() : "CC",
        title: r.title,
        description: r.description,
        positions: r.positions,
        opensAt: r.opensAt,
        closesAt: r.closesAt,
        lastDate: r.closesAt ? new Date(r.closesAt).toISOString().split("T")[0] : "",
        googleFormUrl: r.applicationUrl,
        applicationUrl: r.applicationUrl,
        mode: r.applicationUrl ? "Google Form" : "Internal Portal",
        status: r.status,
      };
    }),
  });
});

adminRouter.post("/recruitments", async (request, response) => {
  const result = recruitmentFieldsSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid recruitment payload");

  let societyId = result.data.societyId;
  if (!societyId) {
    const firstSoc = await Society.findOne().lean();
    societyId = firstSoc ? firstSoc._id.toString() : request.auth!.subject;
  }

  const recruitment = await Recruitment.create({
    ...result.data,
    societyId,
    createdBy: request.auth!.subject,
  });

  response.status(201).json({ recruitment });
});

adminRouter.patch("/recruitments/:recruitmentId", async (request, response) => {
  const { recruitmentId } = request.params;
  assertObjectId(recruitmentId, "Invalid recruitment ID");

  const result = recruitmentPatchSchema.safeParse(request.body);
  if (!result.success) throw new AppError(400, result.error.issues[0]?.message ?? "Invalid recruitment update payload");

  const recruitment = await Recruitment.findById(recruitmentId);
  if (!recruitment) throw new AppError(404, "Recruitment not found");

  Object.assign(recruitment, result.data);
  await recruitment.save();

  response.status(200).json({ recruitment });
});

adminRouter.delete("/recruitments/:recruitmentId", async (request, response) => {
  const { recruitmentId } = request.params;
  assertObjectId(recruitmentId, "Invalid recruitment ID");

  const result = await Recruitment.deleteOne({ _id: recruitmentId });
  if (result.deletedCount === 0) throw new AppError(404, "Recruitment not found");

  response.status(200).json({ message: "Recruitment drive deleted successfully" });
});