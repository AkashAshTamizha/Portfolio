import { validationResult } from "express-validator";
import Rating from "../models/Rating.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import { recalcStats } from "../utils/recalcStats.js";

function firstValidationError(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array()[0].msg;
}

async function assertTargetExists(targetType, targetId) {
  const Model = targetType === "employee" ? Employee : Project;
  return Model.exists({ _id: targetId });
}

// Registered users only. Upserts — resubmitting a rating updates the
// existing one instead of creating a duplicate (enforced by the unique
// compound index on the model as a second line of defense).
export async function submitRating(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const { targetType, target, score } = req.body;

    if (!(await assertTargetExists(targetType, target))) {
      return res.status(404).json({ success: false, message: `${targetType} not found.` });
    }

    const rating = await Rating.findOneAndUpdate(
      { targetType, target, user: req.user._id },
      { score },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await recalcStats(targetType, target);

    res.status(201).json({ success: true, message: "Rating submitted.", data: rating });
  } catch (err) {
    next(err);
  }
}

export async function getAverageRating(req, res, next) {
  try {
    const { targetType, targetId } = req.params;
    const { avgRating, ratingCount } = await recalcStats(targetType, targetId);
    res.json({ success: true, data: { average: avgRating, count: ratingCount } });
  } catch (err) {
    next(err);
  }
}

export async function getMyRating(req, res, next) {
  try {
    const { targetType, targetId } = req.params;
    const rating = await Rating.findOne({ targetType, target: targetId, user: req.user._id });
    res.json({ success: true, data: rating });
  } catch (err) {
    next(err);
  }
}
