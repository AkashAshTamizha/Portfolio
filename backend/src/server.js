// Must be the very first import. "dotenv/config" runs dotenv's config()
// as a side effect the moment THIS import executes — and since imports
// execute in source order, this guarantees process.env is populated
// before any later import (like ./app.js, which transitively configures
// Cloudinary at module-load time) runs. Note: a plain
// `import dotenv from "dotenv"; dotenv.config();` does NOT give this
// guarantee — ES module imports are hoisted, so ./app.js would still load
// (and Cloudinary would configure itself with empty env vars) before the
// dotenv.config() call below it ever executes.
import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
}

start();
