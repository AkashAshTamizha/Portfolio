import Skill from "../models/Skill.js";
import { crudFactory } from "../utils/crudFactory.js";

export default crudFactory(Skill, {
  searchFields: ["name", "category"],
  filterFields: ["category"],
  defaultSort: "category order",
});
