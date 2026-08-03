import { Router } from "express";
import { protect } from "../middleware/auth.js";

// Builds a standard REST router (list/read public, write protected) for a
// controller produced by crudFactory, wired to the given validation rules.
export function buildCrudRouter(controller, validationRules) {
  const router = Router();

  router.get("/", controller.getAll);
  router.get("/:id", controller.getOne);
  router.post("/", protect, validationRules, controller.create);
  router.put("/:id", protect, validationRules, controller.update);
  router.delete("/:id", protect, controller.remove);

  return router;
}
