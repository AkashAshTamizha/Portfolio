import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "../utils/cloudinaryStorage.js";

// Allowed "type" values — used as the Cloudinary sub-folder, keeps uploads
// organized and prevents arbitrary path segments being supplied via the
// `type` query param.
const ALLOWED_TYPES = new Set([
  "profile",
  "projects",
  "certifications",
  "documents",
  "misc",
  "employees",
  "resumes",
]);

const CLOUDINARY_ROOT_FOLDER = process.env.CLOUDINARY_FOLDER || "portfolio";

function resolveFolder(req) {
  const type = ALLOWED_TYPES.has(req.query.type) ? req.query.type : "misc";
  return `${CLOUDINARY_ROOT_FOLDER}/${type}`;
}

const IMAGE_EXT = /jpeg|jpg|png|gif|webp|svg/;
const VIDEO_EXT = /mp4|mov|webm|mkv|avi/;
const DOCUMENT_EXT = /pdf|doc|docx/;

// Cloudinary needs to know the resource_type up front: "image" covers
// images (incl. animated/vector formats like gif/svg), "video" covers
// video (and audio) files, and "raw" is for anything else (pdf/doc/docx)
// so it's stored as-is rather than Cloudinary trying to transform it.
function resourceTypeFor(ext) {
  if (VIDEO_EXT.test(ext)) return "video";
  if (IMAGE_EXT.test(ext)) return "image";
  return "raw";
}

const storage = new CloudinaryStorage({
  getParams: (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    return {
      folder: resolveFolder(req),
      resource_type: resourceTypeFor(ext),
      // Unique-ish public_id so re-uploads never collide; keeps the
      // original (sanitized) filename for readability in the dashboard.
      public_id: `${Date.now()}-${safeName}`,
    };
  },
});

function imageFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = IMAGE_EXT.test(ext);
  const mimeOk = /^image\//.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpg, png, gif, webp, svg) are allowed."));
}

function anyFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const okImage = IMAGE_EXT.test(ext) && /^image\//.test(file.mimetype);
  const okVideo = VIDEO_EXT.test(ext) && /^video\//.test(file.mimetype);
  const okDoc = DOCUMENT_EXT.test(ext);
  if (okImage || okVideo || okDoc) return cb(null, true);
  cb(
    new Error(
      "Only image, video, or document files (jpg, png, gif, webp, svg, mp4, mov, webm, pdf, doc, docx) are allowed."
    )
  );
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("file");

// Accepts images, videos, and documents (pdf/doc/docx) — used for anything
// that isn't strictly a small profile/project image, e.g. resumes,
// certification attachments, project media galleries.
export const uploadAny = multer({
  storage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — covers short video clips
}).single("file");
