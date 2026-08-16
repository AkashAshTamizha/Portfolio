export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  // Multer: wrong file type (from our custom fileFilter) or file-size limit
  // exceeded — both are client input errors, not server failures.
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large." : err.message || "File upload failed.";
    return res.status(400).json({ success: false, message });
  }
  // Our custom fileFilter in middleware/upload.js rejects via a plain Error
  // with no .status/.code — recognizable by this message text.
  if (err.message && /only (image|image or document) files/i.test(err.message)) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Mongoose schema validation (e.g. maxlength, required, enum) — surface the
  // first actual field error instead of a generic 500, same shape express-validator uses.
  if (err.name === "ValidationError" && err.errors) {
    const firstError = Object.values(err.errors)[0];
    return res.status(400).json({
      success: false,
      message: firstError?.message || "Validation failed.",
      errors: Object.entries(err.errors).map(([path, e]) => ({ path, msg: e.message })),
    });
  }

  // Malformed ObjectId, wrong type in a query/param, etc.
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: `Invalid value for '${err.path}'.` });
  }

  // Unique index violation (e.g. duplicate email).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return res.status(409).json({ success: false, message: `That ${field} is already in use.` });
  }

  // Safety net: if the DB connection drops mid-request (after the requireDB
  // guard in app.js already passed), mongoose surfaces this as a generic
  // MongooseError/MongoServerSelectionError rather than something we can
  // catch earlier — report it as 503, not 500.
  if (err.name === "MongooseError" || err.name === "MongoServerSelectionError" || err.name === "MongoNotConnectedError") {
    return res.status(503).json({ success: false, message: "Database unavailable. Please try again shortly." });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error." : err.message,
  });
}
