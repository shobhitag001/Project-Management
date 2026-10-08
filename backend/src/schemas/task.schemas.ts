import { z } from "zod";
import {
  isoDateSchema,
  nonEmptyString,
  nullableIsoDateSchema,
  optionalText,
  paginationSchema,
  sortOrderSchema,
  uuidSchema
} from "./common.js";

export const taskStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z
  .object({
    name: nonEmptyString("Name", 200),
    description: optionalText("Description", 4_000),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    dueDate: nullableIsoDateSchema,
    projectId: uuidSchema
  })
  .strict();

export const updateTaskSchema = z
  .object({
    name: nonEmptyString("Name", 200).optional(),
    description: optionalText("Description", 4_000),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    dueDate: nullableIsoDateSchema,
    projectId: uuidSchema.optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const taskQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().min(1).max(200).optional(),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    projectId: uuidSchema.optional(),
    dueFrom: isoDateSchema.optional(),
    dueTo: isoDateSchema.optional(),
    sortBy: z
      .enum(["name", "status", "priority", "dueDate", "createdAt", "updatedAt"])
      .default("createdAt"),
    sortOrder: sortOrderSchema
  })
  .strict()
  .refine(
    (value) => !value.dueFrom || !value.dueTo || value.dueTo >= value.dueFrom,
    { path: ["dueTo"], message: "dueTo must be on or after dueFrom" }
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
