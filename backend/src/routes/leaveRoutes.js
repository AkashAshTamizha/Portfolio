import { Router } from "express";
import {
  applyLeave,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
} from "../controllers/leaveController.js";
import { protect } from "../middleware/auth.js";
import { authorize, attachEmployee } from "../middleware/authorize.js";
import { leaveValidationRules } from "../middleware/validators.js";

const router = Router();

router.use(protect, attachEmployee, authorize("admin", "employee"));

router.get("/", getAllLeaves);
router.get("/:id", getLeaveById);
router.post("/", leaveValidationRules, applyLeave);
router.patch("/:id/approve", authorize("admin"), approveLeave);
router.patch("/:id/reject", authorize("admin"), rejectLeave);
router.patch("/:id/cancel", cancelLeave);
router.delete("/:id", authorize("admin"), deleteLeave);

export default router;
