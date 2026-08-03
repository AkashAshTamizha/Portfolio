import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

function startOfDay(input = new Date()) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function hoursBetween(a, b) {
  return Math.round(((b - a) / 36e5) * 100) / 100;
}

// Employee: punch in for today. Creates today's record if it doesn't exist yet.
export async function punchIn(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }
    const today = startOfDay();
    let record = await Attendance.findOne({ employee: req.employee._id, date: today });

    if (record?.punchIn) {
      return res.status(400).json({ success: false, message: "You've already punched in today." });
    }

    const wasNew = !record;
    if (!record) record = new Attendance({ employee: req.employee._id, date: today });
    record.punchIn = new Date();
    record.status = "present";
    await record.save();

    res.status(wasNew ? 201 : 200).json({ success: true, message: "Punched in.", data: record });
  } catch (err) {
    next(err);
  }
}

// Employee: punch out for today.
export async function punchOut(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }
    const today = startOfDay();
    const record = await Attendance.findOne({ employee: req.employee._id, date: today });

    if (!record || !record.punchIn) {
      return res.status(400).json({ success: false, message: "You need to punch in first." });
    }
    if (record.punchOut) {
      return res.status(400).json({ success: false, message: "You've already punched out today." });
    }

    record.punchOut = new Date();
    record.workedHours = hoursBetween(record.punchIn, record.punchOut);
    if (record.workedHours < 4) record.status = "half_day";
    await record.save();

    res.json({ success: true, message: "Punched out.", data: record });
  } catch (err) {
    next(err);
  }
}

// Employee: today's own punch status (used by the dashboard widget).
export async function getTodayStatus(req, res, next) {
  try {
    if (!req.employee) return res.json({ success: true, data: null });
    const record = await Attendance.findOne({ employee: req.employee._id, date: startOfDay() });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

// Both roles: history list. Employee is always scoped to themselves;
// admin can filter by ?employee=, ?status=, ?from=, ?to=.
export async function getAllAttendance(req, res, next) {
  try {
    const { page = 1, limit = 30, from, to, employee, status } = req.query;
    const query = {};

    if (req.user.role === "employee") {
      if (!req.employee) {
        return res.json({ success: true, count: 0, total: 0, page: 1, pages: 1, data: [] });
      }
      query.employee = req.employee._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = startOfDay(from);
      if (to) query.date.$lte = startOfDay(to);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Attendance.find(query)
        .populate({ path: "employee", select: "employeeCode user", populate: { path: "user", select: "name" } })
        .sort("-date")
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(query),
    ]);

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

// Admin: monthly summary per employee — present/absent/half-day/leave counts + total hours.
export async function getMonthlyReport(req, res, next) {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const rows = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$employee",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] } },
          onLeave: { $sum: { $cond: [{ $eq: ["$status", "on_leave"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalHours: { $sum: "$workedHours" },
          daysRecorded: { $sum: 1 },
        },
      },
      { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "employee" } },
      { $unwind: "$employee" },
      { $lookup: { from: "users", localField: "employee.user", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $sort: { "user.name": 1 } },
    ]);

    res.json({
      success: true,
      year,
      month,
      data: rows.map((r) => ({
        employeeId: r._id,
        employeeCode: r.employee.employeeCode,
        name: r.user.name,
        present: r.present,
        halfDay: r.halfDay,
        onLeave: r.onLeave,
        absent: r.absent,
        totalHours: Math.round(r.totalHours * 100) / 100,
        daysRecorded: r.daysRecorded,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// Admin: manually add a record (e.g. to mark someone absent, or backfill a day).
export async function createAttendance(req, res, next) {
  try {
    const { employee } = req.body;
    const employeeExists = await Employee.exists({ _id: employee });
    if (!employeeExists) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const normalizedDate = startOfDay(req.body.date);
    const existing = await Attendance.findOne({ employee, date: normalizedDate });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "An attendance record already exists for this employee on this date." });
    }

    const payload = { ...req.body, date: normalizedDate };
    if (payload.punchIn && payload.punchOut) {
      payload.workedHours = hoursBetween(new Date(payload.punchIn), new Date(payload.punchOut));
    }
    const record = await Attendance.create(payload);
    res.status(201).json({ success: true, message: "Attendance record created.", data: record });
  } catch (err) {
    next(err);
  }
}

// Admin: edit any field on a record (status, notes, punch times, etc.).
export async function updateAttendance(req, res, next) {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Attendance record not found." });

    Object.assign(record, req.body);
    if (req.body.date) record.date = startOfDay(req.body.date);
    if (record.punchIn && record.punchOut) {
      record.workedHours = hoursBetween(new Date(record.punchIn), new Date(record.punchOut));
    }
    await record.save();

    res.json({ success: true, message: "Attendance record updated.", data: record });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttendance(req, res, next) {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Attendance record not found." });
    res.json({ success: true, message: "Attendance record deleted." });
  } catch (err) {
    next(err);
  }
}
