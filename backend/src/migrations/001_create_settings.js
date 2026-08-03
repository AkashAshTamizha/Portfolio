// "Migration" for the Settings collection.
//
// MongoDB is schemaless, so there's no DDL migration to run the way you'd
// run one for a SQL `settings` table — the Mongoose schema in
// models/Settings.js is the source of truth for shape and validation, and
// it's applied automatically the moment the app touches the collection.
//
// What a SQL migration WOULD do beyond creating the table — seed exactly
// one default row so the app has something to read on first boot — is what
// this script does. It's idempotent: safe to run once during initial setup
// or re-run any time; it only creates the document if one doesn't exist yet
// (it will never overwrite settings an admin has already saved).
//
// Run with: npm run migrate:settings
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Settings from "../models/Settings.js";

async function run() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error("[migrate:settings] Could not connect to MongoDB. Check MONGO_URI in backend/.env.");
    process.exit(1);
  }

  const existing = await Settings.findOne();
  if (existing) {
    console.log("[migrate:settings] Settings document already exists — nothing to do.");
  } else {
    const settings = await Settings.create({}); // schema defaults fill every field
    console.log(`[migrate:settings] Default settings document created (id: ${settings._id}).`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[migrate:settings] Failed:", err.message);
  process.exit(1);
});
