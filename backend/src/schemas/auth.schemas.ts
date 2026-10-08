import { z } from "zod";
import { nonEmptyString } from "./common.js";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Password must be at most 72 UTF-8 bytes"
  );

export const registerSchema = z
  .object({
    fullName: nonEmptyString("Full name", 100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: passwordSchema
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(1, "Password cannot be empty")
      .max(72)
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Password must be at most 72 UTF-8 bytes"
      )
  })
  .strict();
