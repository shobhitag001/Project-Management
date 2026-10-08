import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

export const authRateLimit = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts; try again later"
    }
  }
});
