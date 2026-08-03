import { Router } from "express";
import { submitRating, getAverageRating, getMyRating } from "../controllers/ratingController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { ratingValidationRules } from "../middleware/validators.js";

const router = Router();

router.get("/:targetType/:targetId/average", getAverageRating);
router.get("/:targetType/:targetId/mine", protect, authorize("user"), getMyRating);
router.post("/", protect, authorize("user"), ratingValidationRules, submitRating);

export default router;
