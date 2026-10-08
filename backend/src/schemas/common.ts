import { z } from "zod";

export const uuidSchema = z.string().uuid("Must be a valid UUID");

export const idParamsSchema = z.object({ id: uuidSchema }).strict();

export const nonEmptyString = (field: string, max: number) =>
  z
    .string({ required_error: `${field} is required` })
    .trim()
    .min(1, `${field} cannot be empty`)
    .max(max, `${field} must be at most ${max} characters`);

export const optionalText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} cannot be empty`)
    .max(max, `${field} must be at most ${max} characters`)
    .nullable()
    .optional();

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoDateTimeSchema = z.string().datetime({ offset: true });

const isValidDateOnly = (value: string) => {
  const match = dateOnlyPattern.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const isoDateSchema = z
  .string()
  .refine(
    (value) => isValidDateOnly(value) || isoDateTimeSchema.safeParse(value).success,
    "Must be a valid YYYY-MM-DD date or ISO 8601 date-time with timezone"
  )
  .transform((value) =>
    dateOnlyPattern.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value)
  );

export const nullableIsoDateSchema = isoDateSchema.nullable().optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");
