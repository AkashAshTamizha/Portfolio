import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Review from "../models/Review.js";
import Skill from "../models/Skill.js";
import Leave from "../models/Leave.js";

export async function getOverviewStats(req, res, next) {
  try {
    const [
      totalEmployees,
      totalProjects,
      totalTasks,
      completedProjects,
      activeProjects,
      pendingTasks,
      pendingLeaves,
      ratingAgg,
    ] = await Promise.all([
      Employee.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Project.countDocuments({ status: "completed" }),
      Project.countDocuments({ status: "in_progress" }),
      Task.countDocuments({ status: { $in: ["todo", "in_progress"] } }),
      Leave.countDocuments({ status: "pending" }),
      Employee.aggregate([{ $group: { _id: null, avg: { $avg: "$stats.avgRating" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalProjects,
        totalTasks,
        completedProjects,
        activeProjects,
        pendingTasks,
        pendingLeaves,
        averageRating: ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectsByStatus(req, res, next) {
  try {
    const rows = await Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    res.json({
      success: true,
      data: rows.map((r) => ({ status: r._id || "planned", count: r.count })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeePerformance(req, res, next) {
  try {
    const employees = await Employee.find({})
      .populate("user", "name")
      .sort("-stats.avgRating")
      .limit(10);
    res.json({
      success: true,
      data: employees.map((e) => ({
        name: e.user?.name || e.employeeCode,
        avgRating: e.stats?.avgRating || 0,
        reviewCount: e.stats?.reviewCount || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyReviews(req, res, next) {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const rows = await Review.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: rows.map((r) => ({ month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`, count: r.count })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getSkillsDistribution(req, res, next) {
  try {
    const rows = await Employee.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills.skill", count: { $sum: 1 } } },
      {
        $lookup: { from: Skill.collection.name, localField: "_id", foreignField: "_id", as: "skill" },
      },
      { $unwind: "$skill" },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.json({
      success: true,
      data: rows.map((r) => ({ name: r.skill.name, count: r.count })),
    });
  } catch (err) {
    next(err);
  }
}
