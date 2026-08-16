import { Router } from "express";
import { submitContactMessage } from "../controllers/contactController.js";
import { contactValidationRules } from "../middleware/validators.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", contactLimiter, contactValidationRules, submitContactMessage);

export default router;
