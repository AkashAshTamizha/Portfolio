import { validationResult } from "express-validator";
import Task from "../models/Task.js";
import Employee from "../models/Employee.js";

function firstValidationError(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array()[0].msg;
}

// Admin: assign a task to an employee.
export async function createTask(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const employeeExists = await Employee.exists({ _id: req.body.employee });
    if (!employeeExists) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const task = await Task.create({ ...req.body, assignedBy: req.user._id });
    res.status(201).json({ success: true, message: "Task assigned.", data: task });
  } catch (err) {
    next(err);
  }
}

// Admin: sees all tasks (optionally filtered by ?employee= or ?project=).
// Employee: only ever sees their own tasks, regardless of query params.
export async function getAllTasks(req, res, next) {
  try {
    const query = {};
    if (req.user.role === "employee") {
      if (!req.employee) return res.json({ success: true, count: 0, data: [] });
      query.employee = req.employee._id;
    } else if (req.query.employee) {
      query.employee = req.query.employee;
    }
    if (req.query.project) query.project = req.query.project;
    if (req.query.status) query.status = req.query.status;

    const tasks = await Task.find(query)
      .populate("employee", "employeeCode")
      .populate("project", "name")
      .sort("-createdAt");

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.id).populate("employee", "employeeCode").populate("project", "name");
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    if (req.user.role === "employee" && (!req.employee || String(task.employee._id) !== String(req.employee._id))) {
      return res.status(403).json({ success: false, message: "You can only view your own tasks." });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// Employee: update progress on their own task only. Admin: can also use this.
export async function updateTaskProgress(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    if (req.user.role === "employee" && (!req.employee || String(task.employee) !== String(req.employee._id))) {
      return res.status(403).json({ success: false, message: "You can only update your own tasks." });
    }

    task.progress = req.body.progress;
    if (req.body.status) task.status = req.body.status;
    await task.save();

    res.json({ success: true, message: "Task progress updated.", data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, message: "Task updated.", data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, message: "Task deleted." });
  } catch (err) {
    next(err);
  }
}
