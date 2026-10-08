import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    "mysql://project_user:project_password@localhost:3306/unused";
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters";
  process.env.CORS_ORIGINS = "http://allowed.example";
});

import { app } from "../src/app.js";

describe("HTTP boundary without a database", () => {
  it("serves health with security headers", async () => {
    const response = await request(app).get("/health").expect(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects malformed registration before persistence", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ fullName: "", email: "bad", password: "short" })
      .expect(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: expect.any(Object)
      }
    });
  });

  it("requires bearer authentication for protected resources", async () => {
    const response = await request(app).get("/api/projects").expect(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("blocks origins outside the configured allowlist", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "http://blocked.example")
      .expect(403);
    expect(response.body.error.code).toBe("CORS_FORBIDDEN");
  });
});
