import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_ROOT = path.resolve("uploads");

// Allowed sub-folders — keeps uploads organized and prevents arbitrary
// path segments being supplied via the `type` field.
const ALLOWED_TYPES = new Set([
  "profile",
  "projects",
  "certifications",
  "documents",
  "misc",
  "employees",
  "resumes",
]);

function resolveDestination(req) {
  const type = ALLOWED_TYPES.has(req.query.type) ? req.query.type : "misc";
  const dir = path.join(UPLOAD_ROOT, type);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => cb(null, resolveDestination(req)),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

const IMAGE_TYPES = /jpeg|jpg|png|gif|webp|svg/;
const DOCUMENT_TYPES = /pdf|doc|docx/;

function imageFileFilter(_req, file, cb) {
  const extOk = IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = IMAGE_TYPES.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpg, png, gif, webp, svg) are allowed."));
}

function anyFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const okImage = IMAGE_TYPES.test(ext) && IMAGE_TYPES.test(file.mimetype);
  const okDoc = DOCUMENT_TYPES.test(ext);
  if (okImage || okDoc) return cb(null, true);
  cb(new Error("Only image or document files (jpg, png, gif, webp, svg, pdf, doc, docx) are allowed."));
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("file");

export const uploadAny = multer({
  storage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("file");
