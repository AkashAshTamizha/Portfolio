import mongoose from "mongoose";

// Fail fast instead of silently queuing queries for up to 10s when there's
// no active connection. Combined with the readyState guard in app.js, this
// means a disconnected DB now surfaces immediately as a clear 503 instead of
// a slow, generic 500.
mongoose.set("bufferCommands", false);

const RETRY_DELAY_MS = 5000;

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "[db] MONGO_URI not set — skipping database connection. " +
        "All /api routes that touch the database will respond with 503 until it's configured."
    );
    return;
  }

  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn(`[db] MongoDB disconnected — retrying in ${RETRY_DELAY_MS / 1000}s`);
    setTimeout(attemptConnect, RETRY_DELAY_MS);
  });

  await attemptConnect();

  async function attemptConnect() {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    } catch (err) {
      // Common causes, surfaced explicitly so they're obvious in Render logs:
      //  - bad username/password                -> "bad auth" / "Authentication failed"
      //  - IP not allow-listed in Atlas          -> "connection timed out" / "ETIMEDOUT"
      //  - cluster paused (free tier auto-pause) -> "connection timed out"
      //  - wrong cluster hostname                -> ENOTFOUND / querySrv ENODATA
      console.error("[db] MongoDB connection error:", err.message);
      console.error(
        "[db] Check: 1) MONGO_URI credentials are correct, " +
          "2) MongoDB Atlas Network Access allow-list includes 0.0.0.0/0 (or Render's IPs), " +
          "3) the Atlas cluster isn't paused."
      );
      console.warn(`[db] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(attemptConnect, RETRY_DELAY_MS);
    }
  }
}
