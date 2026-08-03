import experienceController from "../controllers/experienceController.js";
import { experienceValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";

export default buildCrudRouter(experienceController, experienceValidationRules);
