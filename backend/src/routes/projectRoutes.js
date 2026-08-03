import projectController, { assignTeamMember, removeTeamMember } from "../controllers/projectController.js";
import { projectValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = buildCrudRouter(projectController, projectValidationRules);

router.post("/:id/team", protect, authorize("admin"), assignTeamMember);
router.delete("/:id/team/:employeeId", protect, authorize("admin"), removeTeamMember);

export default router;
