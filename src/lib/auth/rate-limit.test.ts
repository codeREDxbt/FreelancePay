import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, rateLimitHeaders } from "@/lib/auth/rate-limit";

function mockRequest(ip: string): Request {
  return new Request("http://localhost/api/auth/nonce", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows requests within the limit", () => {
    const req = mockRequest("1.2.3.4");
    const result = rateLimit(req, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding the limit", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 5; i++) {
      rateLimit(req, 5, 60_000);
    }
    const result = rateLimit(req, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the time window passes", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 5; i++) {
      rateLimit(req, 5, 60_000);
    }
    vi.advanceTimersByTime(61_000);
    const result = rateLimit(req, 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const reqA = mockRequest("1.1.1.1");
    const reqB = mockRequest("2.2.2.2");
    for (let i = 0; i < 5; i++) {
      rateLimit(reqA, 5, 60_000);
    }
    const result = rateLimit(reqB, 5, 60_000);
    expect(result.allowed).toBe(true);
  });
});

describe("rateLimitHeaders", () => {
  it("returns correct headers", () => {
    const headers = rateLimitHeaders({ remaining: 3, resetAt: 1704067200000 });
    expect(headers.get("X-RateLimit-Remaining")).toBe("3");
    expect(headers.get("X-RateLimit-Reset")).toBe("1704067200000");
  });
});
