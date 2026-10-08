import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Bearer token required", "UNAUTHORIZED");
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      throw new ApiError(401, "Bearer token required", "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);
    const [revoked, user] = await Promise.all([
      prisma.revokedToken.findUnique({
        where: { jti: payload.jti },
        select: { jti: true }
      }),
      prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true }
      })
    ]);

    if (revoked || !user) {
      throw new ApiError(401, "Token is no longer valid", "UNAUTHORIZED");
    }

    req.auth = payload;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(401, "Token has expired", "TOKEN_EXPIRED"));
    }
    if (error instanceof JsonWebTokenError) {
      return next(new ApiError(401, "Invalid token", "UNAUTHORIZED"));
    }
    next(error);
  }
};
