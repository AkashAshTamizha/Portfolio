import { Router } from "express";
import { getSettings, updateSettings, resetSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { settingsValidationRules } from "../middleware/validators.js";

const router = Router();

// Public: the live site (and the admin preview) reads the saved appearance
// settings without needing to be logged in.
router.get("/", getSettings);

// Admin-only: appearance controls the whole site's look, so — unlike
// Profile/ContactInfo, which only require *some* logged-in user — writing
// here is explicitly restricted to the "admin" role.
router.put("/", protect, authorize("admin"), settingsValidationRules, updateSettings);
router.post("/reset", protect, authorize("admin"), resetSettings);

export default router;
