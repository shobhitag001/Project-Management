import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
  JWT_ISSUER: z.string().min(1).default("project-management-api"),
  JWT_AUDIENCE: z.string().min(1).default("project-management-client"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")}`
  );
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
