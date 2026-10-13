import type { Server } from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

let server: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  const exitCode = signal === "SIGINT" || signal === "SIGTERM" ? 0 : 1;
  logger.info({ signal }, "Shutting down server");

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await disconnectDatabase();
    process.exitCode = exitCode;
  } catch (error) {
    logger.error({ error }, "Error during shutdown");
    process.exitCode = 1;
  }
}

async function start(): Promise<void> {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, environment: env.NODE_ENV }, "Server listening");
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("unhandledRejection", (error) => {
  logger.fatal({ error }, "Unhandled promise rejection");
  void shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");
  void shutdown("uncaughtException");
});

start().catch((error: unknown) => {
  logger.fatal({ error }, "Server startup failed");
  process.exitCode = 1;
});