// One-off script to create (or update) the single admin user from env vars.
// Run with: npm run seed
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

async function run() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("[seed] Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding.");
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error("[seed] ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error("[seed] Could not connect to MongoDB. Check MONGO_URI in backend/.env.");
    process.exit(1);
  }

  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select("+password");

  if (user) {
    user.name = ADMIN_NAME || user.name;
    user.password = ADMIN_PASSWORD; // pre-save hook re-hashes
    await user.save();
    console.log(`[seed] Existing admin updated: ${user.email}`);
  } else {
    user = await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
    });
    console.log(`[seed] Admin user created: ${user.email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err.message);
  process.exit(1);
});
