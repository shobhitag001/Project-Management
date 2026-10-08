import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { ApiError } from "./utils/api-error.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        env.CORS_ORIGINS.includes("*") ||
        env.CORS_ORIGINS.includes(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "Origin is not allowed", "CORS_FORBIDDEN"));
    },
    credentials: true
  })
);
app.use(
  pinoHttp({
    logger,
    genReqId(req, res) {
      const supplied = req.headers["x-request-id"];
      const requestId =
        typeof supplied === "string" && supplied.length <= 100 ? supplied : randomUUID();
      res.setHeader("x-request-id", requestId);
      return requestId;
    },
    customLogLevel(_req, res, error) {
      if (error || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    }
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
