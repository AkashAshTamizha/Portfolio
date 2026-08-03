import Experience from "../models/Experience.js";
import { crudFactory } from "../utils/crudFactory.js";

export default crudFactory(Experience, {
  searchFields: ["company", "role", "location"],
  filterFields: ["current"],
  defaultSort: "-startDate",
});
