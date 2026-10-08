import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error.js";

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate = (schemas: Schemas): RequestHandler => {
  return (req, _res, next) => {
    const validated: NonNullable<typeof req.validated> = {};

    for (const key of ["body", "query", "params"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        return next(
          new ApiError(400, "Validation failed", "VALIDATION_ERROR", result.error.flatten())
        );
      }
      validated[key] = result.data;
    }

    req.validated = validated;
    next();
  };
};
