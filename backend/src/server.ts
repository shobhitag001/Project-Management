import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";

const server = createServer(app);

const start = async () => {
  await prisma.$connect();
  await prisma.revokedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API server listening");
  });
};

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");
  server.close(async (error) => {
    await prisma.$disconnect();
    if (error) {
      logger.error({ err: error }, "Shutdown failed");
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch(async (error) => {
  logger.fatal({ err: error }, "Failed to start server");
  await prisma.$disconnect();
  process.exit(1);
});
