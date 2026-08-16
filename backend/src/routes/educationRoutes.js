import educationController from "../controllers/educationController.js";
import { educationValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";

export default buildCrudRouter(educationController, educationValidationRules);
