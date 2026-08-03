import { Router } from "express";
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getAllAttendance,
  getMonthlyReport,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/auth.js";
import { authorize, attachEmployee } from "../middleware/authorize.js";
import { attendanceValidationRules } from "../middleware/validators.js";

const router = Router();

router.use(protect, attachEmployee, authorize("admin", "employee"));

router.get("/", getAllAttendance);
router.get("/today", getTodayStatus);
router.get("/report/monthly", authorize("admin"), getMonthlyReport);
router.post("/punch-in", punchIn);
router.post("/punch-out", punchOut);
router.post("/", authorize("admin"), attendanceValidationRules, createAttendance);
router.put("/:id", authorize("admin"), updateAttendance);
router.delete("/:id", authorize("admin"), deleteAttendance);

export default router;
