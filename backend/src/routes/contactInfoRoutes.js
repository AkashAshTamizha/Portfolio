import { Router } from "express";
import { getContactInfo, updateContactInfo } from "../controllers/contactInfoController.js";
import { protect } from "../middleware/auth.js";
import { contactInfoValidationRules } from "../middleware/validators.js";

const router = Router();

router.get("/", getContactInfo);
router.put("/", protect, contactInfoValidationRules, updateContactInfo);

export default router;
