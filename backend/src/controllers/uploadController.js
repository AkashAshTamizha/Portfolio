export function handleImageUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file was uploaded." });
  }
  const type = ["profile", "projects", "certifications", "documents", "misc"].includes(req.query.type)
    ? req.query.type
    : "misc";
  const url = `/uploads/${type}/${req.file.filename}`;
  res.status(201).json({
    success: true,
    message: "File uploaded successfully.",
    data: { url, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size },
  });
}
