import { Router } from "express";
import {
  login,
  register,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  setupStatus,
  setupAdmin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  loginValidationRules,
  registerValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  updatePasswordValidationRules,
  setupValidationRules,
} from "../middleware/validators.js";

const router = Router();

router.get("/setup-status", setupStatus);
router.post("/setup", authLimiter, setupValidationRules, setupAdmin);
router.post("/register", authLimiter, registerValidationRules, register);
router.post("/login", authLimiter, loginValidationRules, login);
router.post("/forgot-password", authLimiter, forgotPasswordValidationRules, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordValidationRules, resetPassword);
router.get("/me", protect, getMe);
router.put("/update-password", protect, updatePasswordValidationRules, updatePassword);

export default router;
