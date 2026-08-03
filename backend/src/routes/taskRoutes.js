import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskProgress,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";
import { authorize, attachEmployee } from "../middleware/authorize.js";
import { taskValidationRules, taskProgressValidationRules } from "../middleware/validators.js";

const router = Router();

router.use(protect, attachEmployee, authorize("admin", "employee"));

router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.post("/", authorize("admin"), taskValidationRules, createTask);
router.put("/:id", authorize("admin"), updateTask);
router.patch("/:id/progress", taskProgressValidationRules, updateTaskProgress);
router.delete("/:id", authorize("admin"), deleteTask);

export default router;
