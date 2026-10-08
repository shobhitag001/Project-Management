import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/schemas/auth.schemas.js";
import {
  createProjectSchema,
  updateProjectSchema
} from "../src/schemas/project.schemas.js";
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema
} from "../src/schemas/task.schemas.js";

describe("request validation", () => {
  it("normalizes registration email and rejects weak passwords", () => {
    const valid = registerSchema.parse({
      fullName: "Ada Lovelace",
      email: " ADA@EXAMPLE.COM ",
      password: "Secure123"
    });
    expect(valid.email).toBe("ada@example.com");

    expect(
      registerSchema.safeParse({
        fullName: "Ada",
        email: "ada@example.com",
        password: "password"
      }).success
    ).toBe(false);
  });

  it("rejects empty project fields and reversed project dates", () => {
    expect(createProjectSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(
      createProjectSchema.safeParse({
        name: "Launch",
        startDate: "2026-10-08",
        endDate: "2026-10-31"
      }).success
    ).toBe(true);
    expect(
      createProjectSchema.safeParse({
        name: "Launch",
        startDate: "2026-02-30"
      }).success
    ).toBe(false);
    expect(
      createProjectSchema.safeParse({
        name: "Launch",
        startDate: "2026-10-10T00:00:00.000Z",
        endDate: "2026-10-09T00:00:00.000Z"
      }).success
    ).toBe(false);
    expect(updateProjectSchema.safeParse({}).success).toBe(false);
  });

  it("validates task enums, IDs and empty updates", () => {
    expect(
      createTaskSchema.safeParse({
        name: "Work",
        projectId: "not-an-id",
        status: "started"
      }).success
    ).toBe(false);
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
    expect(
      createTaskSchema.safeParse({
        name: "Work",
        projectId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        priority: "HIGH"
      }).success
    ).toBe(true);
    expect(
      createTaskSchema.safeParse({
        name: "Work",
        projectId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        status: "PENDING",
        priority: "LOW"
      }).success
    ).toBe(true);
  });

  it("coerces pagination and rejects invalid date ranges", () => {
    const query = taskQuerySchema.parse({ page: "2", limit: "25" });
    expect(query).toMatchObject({ page: 2, limit: 25, sortBy: "createdAt" });

    expect(
      taskQuerySchema.safeParse({
        dueFrom: "2026-10-10T00:00:00.000Z",
        dueTo: "2026-10-09T00:00:00.000Z"
      }).success
    ).toBe(false);
  });
});
