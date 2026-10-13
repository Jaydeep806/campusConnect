import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { AppError } from "../middleware/app-error.js";
import { authenticate, authorize } from "../middleware/authenticate.js";
import { Announcement } from "../models/announcement.model.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("admin"));

const announcementSchema = z.object({
  title: z.string().trim().min(4).max(160),
  body: z.string().trim().min(5).max(10000),
  status: z.enum(["draft", "published"]).default("published"),
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
  if (!isValidObjectId(clubId)) throw new AppError(400, "Invalid club ID");

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