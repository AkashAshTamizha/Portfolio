export function handleImageUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file was uploaded." });
  }

  // multer-storage-cloudinary populates:
  //   req.file.path       -> the file's secure Cloudinary URL
  //   req.file.filename   -> the Cloudinary public_id (folder/name, no extension)
  const url = req.file.path;

  res.status(201).json({
    success: true,
    message: "File uploaded successfully.",
    data: {
      url,
      publicId: req.file.filename,
      resourceType: req.file.resource_type || (req.file.mimetype?.startsWith("video/") ? "video" : "image"),
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
}
