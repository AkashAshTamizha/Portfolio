import { validationResult } from "express-validator";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Review from "../models/Review.js";
import { recalcEmployeeProjectCount } from "../utils/recalcStats.js";

const PUBLIC_USER_FIELDS = "name email";

function firstValidationError(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array()[0].msg;
}

export async function getAllEmployees(req, res, next) {
  try {
    const { search, designation, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (designation) query.designation = designation;
    // Guests/registered users only ever see active employees; admins/employees see everything.
    if (!req.user || req.user.role === "user") {
      query.status = "active";
    } else if (status) {
      query.status = status;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    let employeeQuery = Employee.find(query)
      .populate("user", PUBLIC_USER_FIELDS)
      .populate("skills.skill", "name category")
      .sort("-createdAt")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    let items = await employeeQuery;

    if (search) {
      const re = new RegExp(search, "i");
      items = items.filter((e) => re.test(e.user?.name || "") || re.test(e.designation || ""));
    }

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      count: items.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyEmployeeRecord(req, res, next) {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate("user", PUBLIC_USER_FIELDS)
      .populate("skills.skill", "name category");
    if (!employee) {
      return res.status(404).json({ success: false, message: "No employee profile linked to this account." });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("user", PUBLIC_USER_FIELDS)
      .populate("skills.skill", "name category");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

// Admin-only: creates the linked User (role=employee) and Employee profile
// together so an employee always has exactly one login.
//
// Deliberately does NOT use a Mongo transaction: transactions require a
// replica set, which a plain local `mongod` doesn't run by default. Instead,
// if Employee creation fails after the User was created, we roll the User
// back manually so a half-created employee can never exist.
export async function createEmployee(req, res, next) {
  const msg = firstValidationError(req);
  if (msg) return res.status(400).json({ success: false, message: msg });

  const { name, email, password, employeeCode, designation, experience, phone, about } = req.body;
  let user;

  try {
    user = await User.create({ name, email: email.toLowerCase(), password, role: "employee" });

    const employee = await Employee.create({
      user: user._id,
      employeeCode,
      designation,
      experience,
      about,
      contact: phone ? { phone } : undefined,
    });

    const populated = await Employee.findById(employee._id).populate("user", PUBLIC_USER_FIELDS);
    res.status(201).json({ success: true, message: "Employee created successfully.", data: populated });
  } catch (err) {
    if (user && !(await Employee.exists({ user: user._id }))) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "value";
      return res.status(409).json({ success: false, message: `That ${field} is already in use.` });
    }
    next(err);
  }
}

// Admin: full edit. Employee (own profile): only the whitelisted subset of
// fields — enforced here rather than trusting the client to omit fields.
export async function updateEmployee(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const isSelfService = req.user.role === "employee";
    const allowedForSelf = [
      "about",
      "designation",
      "experience",
      "skills",
      "education",
      "certifications",
      "socialLinks",
      "contact",
      "photo",
    ];

    const updates = isSelfService
      ? Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedForSelf.includes(key)))
      : req.body;

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", PUBLIC_USER_FIELDS);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    res.json({ success: true, message: "Employee updated successfully.", data: employee });
  } catch (err) {
    next(err);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    // Deactivate rather than delete the linked login, so historical
    // projects/tasks/reviews referencing this employee keep resolvable data.
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    res.json({ success: true, message: "Employee deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function setEmployeeStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    await User.findByIdAndUpdate(employee.user, { isActive: status === "active" });
    res.json({ success: true, message: `Employee marked as ${status}.`, data: employee });
  } catch (err) {
    next(err);
  }
}

export async function uploadEmployeePhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file was uploaded." });
    const url = `/uploads/employees/${req.file.filename}`;
    const employee = await Employee.findByIdAndUpdate(req.params.id, { photo: url }, { new: true });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
    res.status(201).json({ success: true, message: "Photo uploaded.", data: { url, employee } });
  } catch (err) {
    next(err);
  }
}

export async function uploadEmployeeResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file was uploaded." });
    const url = `/uploads/resumes/${req.file.filename}`;
    const resume = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      url,
      uploadedAt: new Date(),
    };
    const employee = await Employee.findByIdAndUpdate(req.params.id, { resume }, { new: true });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
    res.status(201).json({ success: true, message: "Resume uploaded.", data: employee });
  } catch (err) {
    next(err);
  }
}

// Projects an employee has worked on — reads off Project.team.employee,
// which is the embedded equivalent of an EmployeeProject join table.
export async function getEmployeeProjects(req, res, next) {
  try {
    const projects = await Project.find({ "team.employee": req.params.id }).sort("-createdAt");
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeReviews(req, res, next) {
  try {
    const reviews = await Review.find({ targetType: "employee", target: req.params.id })
      .populate("user", "name")
      .sort("-createdAt");
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
}

// Called by admin (e.g. after manually editing a project's team array via
// a script) to force-recompute totalProjects if it ever drifts.
export async function refreshEmployeeStats(req, res, next) {
  try {
    const totalProjects = await recalcEmployeeProjectCount(req.params.id);
    res.json({ success: true, data: { totalProjects } });
  } catch (err) {
    next(err);
  }
}
