import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase(): Promise<void> {
  // Use public DNS resolvers to prevent ECONNREFUSED querySrv on local ISPs
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch (dnsErr) {
    logger.warn({ error: dnsErr }, "Could not set custom DNS servers");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  logger.info("Connected to MongoDB");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}