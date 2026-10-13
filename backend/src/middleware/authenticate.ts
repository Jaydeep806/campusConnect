import type { RequestHandler } from "express";
import { AppError } from "./app-error.js";
import { readAccessToken, type AuthClaims, type AuthRole } from "../auth/tokens.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
      clubOwnerId?: string;
    }
  }
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authorization = request.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  if (!token) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    request.auth = await readAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
};

export function authorize(...allowedRoles: AuthRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new AppError(401, "Authentication required"));
      return;
    }
    if (!allowedRoles.includes(request.auth.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
}