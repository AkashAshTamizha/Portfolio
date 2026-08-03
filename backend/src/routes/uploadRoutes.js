import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { uploadImage, uploadAny } from "../middleware/upload.js";
import { handleImageUpload } from "../controllers/uploadController.js";

const router = Router();

function multerErrorWrap(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  };
}

// ?type=profile|projects|certifications|documents|misc
router.post("/image", protect, multerErrorWrap(uploadImage), handleImageUpload);
router.post("/file", protect, multerErrorWrap(uploadAny), handleImageUpload);

export default router;
