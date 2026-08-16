import { v2 as cloudinary } from "cloudinary";

// IMPORTANT: configuration is deliberately lazy (done on first use inside
// ensureConfigured(), not at module-import time). If this configured
// cloudinary.config() as soon as the module loaded, it would be at risk of
// running before process.env is populated — dotenv loading order across
// ES module imports is easy to get subtly wrong (see server.js for the
// full explanation), and a silently-misconfigured Cloudinary client fails
// every upload with no obvious cause. Configuring lazily means it always
// reads process.env at the moment a file is actually uploaded, by which
// point .env has certainly been loaded.
let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  configured = true;
}

export function isCloudinaryConfigured() {
  ensureConfigured();
  const c = cloudinary.config();
  return Boolean(c.cloud_name && c.api_key && c.api_secret);
}

// Call this before any cloudinary.uploader.* call to guarantee config has
// happened. Returns the cloudinary instance for convenience.
export function getCloudinary() {
  ensureConfigured();
  return cloudinary;
}

export default cloudinary;
