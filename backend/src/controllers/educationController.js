import Education from "../models/Education.js";
import { crudFactory } from "../utils/crudFactory.js";

export default crudFactory(Education, {
  searchFields: ["institution", "degree", "field"],
  filterFields: [],
  defaultSort: "-startDate",
});
