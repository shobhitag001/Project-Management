import { z } from "zod";
import {
  isoDateSchema,
  nonEmptyString,
  nullableIsoDateSchema,
  optionalText,
  paginationSchema,
  sortOrderSchema
} from "./common.js";

export const projectStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED"
] as const;
const projectStatusSchema = z.enum(projectStatuses);

const datesAreOrdered = (
  value: { startDate?: Date | null; endDate?: Date | null },
  context: z.RefinementCtx
) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "endDate must be on or after startDate"
    });
  }
};

export const createProjectSchema = z
  .object({
    name: nonEmptyString("Name", 150),
    description: optionalText("Description", 2_000),
    status: projectStatusSchema.optional(),
    startDate: nullableIsoDateSchema,
    endDate: nullableIsoDateSchema
  })
  .strict()
  .superRefine(datesAreOrdered);

export const updateProjectSchema = z
  .object({
    name: nonEmptyString("Name", 150).optional(),
    description: optionalText("Description", 2_000),
    status: projectStatusSchema.optional(),
    startDate: nullableIsoDateSchema,
    endDate: nullableIsoDateSchema
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required")
  .superRefine(datesAreOrdered);

export const projectQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().min(1).max(150).optional(),
    status: projectStatusSchema.optional(),
    sortBy: z
      .enum(["name", "status", "startDate", "endDate", "createdAt", "updatedAt"])
      .default("createdAt"),
    sortOrder: sortOrderSchema
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
