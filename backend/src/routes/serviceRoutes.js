import serviceController from "../controllers/serviceController.js";
import { serviceValidationRules } from "../middleware/validators.js";
import { buildCrudRouter } from "./crudRoutes.js";

export default buildCrudRouter(serviceController, serviceValidationRules);
