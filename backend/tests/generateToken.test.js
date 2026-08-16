import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken } from "../src/utils/generateToken.js";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
  process.env.JWT_EXPIRES_IN = "1h";
});

describe("generateToken", () => {
  it("produces a JWT that decodes back to the given user id", () => {
    const token = generateToken("64f0000000000000000000ab");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe("64f0000000000000000000ab");
    expect(decoded.exp).toBeDefined();
  });

  it("throws when no JWT_SECRET is configured", () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => generateToken("someUserId")).toThrow();

    process.env.JWT_SECRET = original;
  });
});
