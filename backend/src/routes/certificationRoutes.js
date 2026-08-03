import certificationController from "../controllers/certificationController.js";
import { certificationValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";

export default buildCrudRouter(certificationController, certificationValidationRules);
