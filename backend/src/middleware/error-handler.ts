import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`, "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {})
      }
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body contains invalid JSON" }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "A record with this value already exists" }
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "Resource not found" }
      });
      return;
    }
  }

  logger.error({ err: error, requestId: req.id }, "Unhandled request error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(env.NODE_ENV === "development" && error instanceof Error
        ? { details: error.message }
        : {})
    }
  });
};
