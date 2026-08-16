import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { profileValidationRules } from "../middleware/validators.js";

const router = Router();

router.get("/", getProfile);
router.put("/", protect, profileValidationRules, updateProfile);

export default router;
