export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[error]", err);

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

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error." : err.message,
  });
}
