import skillController from "../controllers/skillController.js";
import { skillValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";

export default buildCrudRouter(skillController, skillValidationRules);
