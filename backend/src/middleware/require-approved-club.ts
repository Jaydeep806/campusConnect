import type { RequestHandler } from "express";
import { AppError } from "./app-error.js";
import { User } from "../models/user.model.js";

export const requireApprovedClub: RequestHandler = async (request, _response, next) => {
  if (!request.auth || request.auth.role !== "club") {
    next(new AppError(403, "Approved club account required"));
    return;
  }

  try {
    const club = await User.findOne({ _id: request.auth.subject, accountType: "club" }).select("approvalStatus");
    if (!club) {
      next(new AppError(401, "Club account no longer exists"));
      return;
    }
    if (club.approvalStatus !== "approved") {
      next(new AppError(403, "Club registration is pending admin approval"));
      return;
    }

    request.clubOwnerId = club.id;
    next();
  } catch (error) {
    next(error);
  }
};