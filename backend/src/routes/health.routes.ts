import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/live", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

healthRouter.get("/ready", (_request, response) => {
  const databaseReady = mongoose.connection.readyState === 1;
  response.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "unavailable",
    checks: { database: databaseReady ? "connected" : "disconnected" },
  });
});