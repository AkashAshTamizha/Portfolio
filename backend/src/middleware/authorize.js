import Employee from "../models/Employee.js";

// Restricts a route to one or more roles. Use after `protect` so
// `req.user` is already populated.
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to do this." });
    }
    next();
  };
}

// Loads the Employee document owned by the logged-in user (if any) onto
// `req.employee`. Safe to use even for admins (will just be null for them).
export async function attachEmployee(req, res, next) {
  try {
    if (req.user?.role === "employee") {
      req.employee = await Employee.findOne({ user: req.user._id });
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Allows admins through unconditionally; allows an employee through only
// when the :id param in the route matches their own Employee document.
export function ownEmployeeOnly(req, res, next) {
  if (req.user.role === "admin") return next();
  if (req.user.role === "employee" && req.employee && String(req.employee._id) === String(req.params.id)) {
    return next();
  }
  return res.status(403).json({ success: false, message: "You can only manage your own profile." });
}

// Same idea, but for resources (e.g. Tasks) that reference an employee via
// a `req.resourceEmployeeId` set by the controller after loading the doc.
export function ownResourceOnly(req, res, next) {
  if (req.user.role === "admin") return next();
  if (
    req.user.role === "employee" &&
    req.employee &&
    req.resourceEmployeeId &&
    String(req.employee._id) === String(req.resourceEmployeeId)
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: "You can only manage your own records." });
}
