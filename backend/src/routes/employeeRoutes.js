import { Router } from "express";
import {
  getAllEmployees,
  getEmployeeById,
  getMyEmployeeRecord,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployeeStatus,
  uploadEmployeePhoto,
  uploadEmployeeResume,
  getEmployeeProjects,
  getEmployeeReviews,
  refreshEmployeeStats,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/auth.js";
import { authorize, attachEmployee, ownEmployeeOnly } from "../middleware/authorize.js";
import { uploadImage, uploadAny } from "../middleware/upload.js";
import { employeeCreateValidationRules, employeeUpdateValidationRules } from "../middleware/validators.js";

const router = Router();

// Public — anyone (including guests) can browse the directory.
router.get("/", getAllEmployees);
// Must be registered before the "/:id" param route below, or a request to
// "/me" would be interpreted as ":id" = "me".
router.get("/me", protect, attachEmployee, authorize("employee"), getMyEmployeeRecord);
router.get("/:id", getEmployeeById);
router.get("/:id/projects", getEmployeeProjects);
router.get("/:id/reviews", getEmployeeReviews);

// Everything below requires a logged-in user, then role checks per-route.
router.use(protect, attachEmployee);

router.post("/", authorize("admin"), employeeCreateValidationRules, createEmployee);
router.put("/:id", authorize("admin", "employee"), ownEmployeeOnly, employeeUpdateValidationRules, updateEmployee);
router.delete("/:id", authorize("admin"), deleteEmployee);
router.patch("/:id/status", authorize("admin"), setEmployeeStatus);
router.post("/:id/photo", authorize("admin", "employee"), ownEmployeeOnly, uploadImage, uploadEmployeePhoto);
router.post("/:id/resume", authorize("admin", "employee"), ownEmployeeOnly, uploadAny, uploadEmployeeResume);
router.post("/:id/refresh-stats", authorize("admin"), refreshEmployeeStats);

export default router;
