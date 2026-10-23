import { randomUUID } from "node:crypto";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { corsOrigins, env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { AppError } from "./middleware/app-error.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRouter } from "./routes/api.routes.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY ? 1 : false);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      corsOrigins.includes("*") ||
      corsOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://10.") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("exp://") ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".netlify.app")
    ) {
      callback(null, true);
      return;
    }
    callback(new AppError(403, "Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-request-id", "Accept"],
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(pinoHttp({
  logger,
  genReqId(_request, response) {
    const requestId = randomUUID();
    response.setHeader("x-request-id", requestId);
    return requestId;
  },
  customLogLevel(request, response, error) {
    if (response.statusCode === 503) return "warn";
    if (error || response.statusCode >= 500) return "error";
    if (response.statusCode >= 400) return "warn";
    return "info";
  },
}));

app.use("/health", healthRouter);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "production" ? 100 : 10000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  validate: { trustProxy: false },
}));
app.use("/", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);