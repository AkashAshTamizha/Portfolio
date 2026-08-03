import { Router } from "express";
import {
  getOverviewStats,
  getProjectsByStatus,
  getEmployeePerformance,
  getMonthlyReviews,
  getSkillsDistribution,
} from "../controllers/adminStatsController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/", getOverviewStats);
router.get("/projects-by-status", getProjectsByStatus);
router.get("/employee-performance", getEmployeePerformance);
router.get("/reviews-monthly", getMonthlyReviews);
router.get("/skills-distribution", getSkillsDistribution);

export default router;
