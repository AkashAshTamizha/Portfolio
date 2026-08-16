import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import contactInfoRoutes from "./routes/contactInfoRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ---------------------------------------------------------------------------
// CORS
//
// CLIENT_ORIGIN is a comma-separated list of exact origins allowed to call
// this API, e.g.:
//   CLIENT_ORIGIN=https://myportfolio.vercel.app,http://localhost:5173,http://localhost:4173
//
// Each entry must match the browser's Origin header EXACTLY — same scheme,
// host, and port, no trailing slash. "http://localhost:5173" and
// "http://localhost:4173" are different origins (Vite dev server vs. Vite
// preview server), so list both if you test with `vite preview` locally.
// ---------------------------------------------------------------------------
const defaultOrigins = ["http://localhost:5173", "http://localhost:4173"];
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      // requests with no Origin header (curl, server-to-server, health checks)
      // are always allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // IMPORTANT: never pass an Error into this callback. Doing so makes
      // the `cors` package call next(err), which lands in errorHandler and
      // gets reported as a generic 500 — while the browser ALSO reports a
      // CORS failure because no Access-Control-Allow-Origin header was set.
      // Passing `false` here just omits the CORS headers, which is the
      // correct/expected way to reject a cross-origin request.
      console.warn(`[cors] rejected origin "${origin}" — not in CLIENT_ORIGIN allow-list`);
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ---------------------------------------------------------------------------
// DB-readiness guard, applied per-router below (not globally) so that
// requests to genuinely unknown routes still fall through to the 404
// handler instead of being masked as 503. When MongoDB isn't connected,
// routes that need it fail fast with a clear 503 instead of hanging for
// ~10s and then surfacing as an opaque 500 (mongoose's default
// query-buffering timeout).
// ---------------------------------------------------------------------------
function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again shortly.",
    });
  }
  next();
}

app.use("/api/auth", requireDB, authRoutes);
app.use("/api/profile", requireDB, profileRoutes);
app.use("/api/contact-info", requireDB, contactInfoRoutes);
app.use("/api/upload", requireDB, uploadRoutes);
app.use("/api/skills", requireDB, skillRoutes);
app.use("/api/services", requireDB, serviceRoutes);
app.use("/api/experience", requireDB, experienceRoutes);
app.use("/api/education", requireDB, educationRoutes);
app.use("/api/certifications", requireDB, certificationRoutes);
app.use("/api/projects", requireDB, projectRoutes);
app.use("/api/contact", requireDB, contactRoutes);
app.use("/api/employees", requireDB, employeeRoutes);
app.use("/api/tasks", requireDB, taskRoutes);
app.use("/api/attendance", requireDB, attendanceRoutes);
app.use("/api/leaves", requireDB, leaveRoutes);
app.use("/api/ratings", requireDB, ratingRoutes);
app.use("/api/reviews", requireDB, reviewRoutes);
app.use("/api/settings", requireDB, settingsRoutes);
app.use("/api/admin/stats", requireDB, adminStatsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
