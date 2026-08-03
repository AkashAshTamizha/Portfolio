import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 with a success payload", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: "ok" });
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Unknown routes", () => {
  it("returns 404 for a route that does not exist", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
  });
});
