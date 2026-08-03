import { Router } from "express";
import {
  createReview,
  getReviewsForTarget,
  updateReview,
  deleteReview,
  getMyReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { reviewValidationRules, reviewUpdateValidationRules } from "../middleware/validators.js";

const router = Router();

router.get("/mine", protect, authorize("user"), getMyReviews);
router.get("/:targetType/:targetId", getReviewsForTarget);
router.post("/", protect, authorize("user"), reviewValidationRules, createReview);
router.put("/:id", protect, authorize("user"), reviewUpdateValidationRules, updateReview);
router.delete("/:id", protect, authorize("user", "admin"), deleteReview);

export default router;
