import { describe, expect, it } from "vitest";
import { paginationArgs, paginationMeta } from "../src/utils/pagination.js";

describe("pagination helpers", () => {
  it("calculates database offsets and response metadata", () => {
    expect(paginationArgs({ page: 3, limit: 10 })).toEqual({ skip: 20, take: 10 });
    expect(paginationMeta(24, { page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      total: 24,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true
    });
  });

  it("reports zero pages for an empty collection", () => {
    expect(paginationMeta(0, { page: 1, limit: 20 }).totalPages).toBe(0);
  });
});
