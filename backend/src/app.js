import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";

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

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve uploaded images/documents statically
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact-info", contactInfoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin/stats", adminStatsRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
