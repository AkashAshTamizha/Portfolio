import { validationResult } from "express-validator";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";

function firstValidationError(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array()[0].msg;
}

// Employee: submit a leave request.
export async function applyLeave(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });
    if (!req.employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
      return res.status(400).json({ success: false, message: "End date cannot be before start date." });
    }

    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType: req.body.leaveType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason,
    });
    res.status(201).json({ success: true, message: "Leave request submitted.", data: leave });
  } catch (err) {
    next(err);
  }
}

// Admin: sees all requests (optional ?status= / ?employee= filters).
// Employee: only ever sees their own, regardless of query params.
export async function getAllLeaves(req, res, next) {
  try {
    const query = {};
    if (req.user.role === "employee") {
      if (!req.employee) return res.json({ success: true, count: 0, data: [] });
      query.employee = req.employee._id;
    } else if (req.query.employee) {
      query.employee = req.query.employee;
    }
    if (req.query.status) query.status = req.query.status;

    const leaves = await Leave.find(query)
      .populate({ path: "employee", select: "employeeCode user", populate: { path: "user", select: "name" } })
      .populate("reviewedBy", "name")
      .sort("-createdAt");

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    next(err);
  }
}

export async function getLeaveById(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id).populate("employee", "employeeCode");
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });
    if (req.user.role === "employee" && (!req.employee || String(leave.employee._id) !== String(req.employee._id))) {
      return res.status(403).json({ success: false, message: "You can only view your own leave requests." });
    }
    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
}

// Admin: approve a pending request. Also back-fills Attendance with
// status "on_leave" for every day in the range, so reports stay consistent.
export async function approveLeave(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });
    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be approved." });
    }

    leave.status = "approved";
    leave.reviewedBy = req.user._id;
    leave.reviewNote = req.body.reviewNote || "";
    await leave.save();

    const ops = [];
    const cursor = new Date(leave.startDate);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(leave.endDate);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const day = new Date(cursor);
      ops.push({
        updateOne: {
          filter: { employee: leave.employee, date: day },
          update: { $setOnInsert: { employee: leave.employee, date: day }, $set: { status: "on_leave" } },
          upsert: true,
        },
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (ops.length) await Attendance.bulkWrite(ops);

    res.json({ success: true, message: "Leave approved.", data: leave });
  } catch (err) {
    next(err);
  }
}

export async function rejectLeave(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });
    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be rejected." });
    }
    leave.status = "rejected";
    leave.reviewedBy = req.user._id;
    leave.reviewNote = req.body.reviewNote || "";
    await leave.save();
    res.json({ success: true, message: "Leave rejected.", data: leave });
  } catch (err) {
    next(err);
  }
}

// Employee (or admin): cancel a still-pending request.
export async function cancelLeave(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });
    if (req.user.role === "employee" && (!req.employee || String(leave.employee) !== String(req.employee._id))) {
      return res.status(403).json({ success: false, message: "You can only cancel your own leave requests." });
    }
    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be cancelled." });
    }
    leave.status = "cancelled";
    await leave.save();
    res.json({ success: true, message: "Leave request cancelled.", data: leave });
  } catch (err) {
    next(err);
  }
}

export async function deleteLeave(req, res, next) {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found." });
    res.json({ success: true, message: "Leave request deleted." });
  } catch (err) {
    next(err);
  }
}
