import Certification from "../models/Certification.js";
import { crudFactory } from "../utils/crudFactory.js";

export default crudFactory(Certification, {
  searchFields: ["name", "issuer"],
  filterFields: ["issuer"],
  defaultSort: "-issueDate",
});
