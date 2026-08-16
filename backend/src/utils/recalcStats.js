import Rating from "../models/Rating.js";
import Review from "../models/Review.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";

/**
 * Recomputes the denormalized avgRating/reviewCount stored on the target
 * Employee or Project document. Called after every Rating/Review
 * create/update/delete so profile pages can read stats off one document
 * instead of running a live aggregation on every page view.
 */
export async function recalcStats(targetType, targetId) {
  const Model = targetType === "employee" ? Employee : Project;

  const [ratingAgg, reviewCount] = await Promise.all([
    Rating.aggregate([
      { $match: { targetType, target: targetId } },
      { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
    ]),
    Review.countDocuments({ targetType, target: targetId }),
  ]);

  const avgRating = ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0;
  const ratingCount = ratingAgg[0]?.count || 0;

  await Model.findByIdAndUpdate(targetId, {
    $set: {
      "stats.avgRating": avgRating,
      "stats.reviewCount": reviewCount,
      ...(targetType === "employee" ? {} : {}),
    },
  });

  return { avgRating, ratingCount, reviewCount };
}

/**
 * Recomputes Employee.stats.totalProjects by counting Project documents
 * that list this employee in their team roster.
 */
export async function recalcEmployeeProjectCount(employeeId) {
  const totalProjects = await Project.countDocuments({ "team.employee": employeeId });
  await Employee.findByIdAndUpdate(employeeId, { $set: { "stats.totalProjects": totalProjects } });
  return totalProjects;
}
