import type { ErrorRequestHandler } from "express";
import { logger } from "../config/logger.js";
import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { message: error.message },
    });
    return;
  }

  logger.error({ error, path: request.path }, "Unhandled request error");
  response.status(500).json({
    error: { message: "Internal server error" },
  });
};