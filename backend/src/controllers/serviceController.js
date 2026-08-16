import Service from "../models/Service.js";
import { crudFactory } from "../utils/crudFactory.js";

export default crudFactory(Service, {
  searchFields: ["title", "description"],
  filterFields: ["featured"],
});
