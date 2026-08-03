import { validationResult } from "express-validator";
import Review from "../models/Review.js";
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

export async function createReview(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const { targetType, target, text } = req.body;

    if (!(await assertTargetExists(targetType, target))) {
      return res.status(404).json({ success: false, message: `${targetType} not found.` });
    }

    const existing = await Review.findOne({ targetType, target, user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You've already reviewed this. Edit your existing review instead.",
      });
    }

    const review = await Review.create({ targetType, target, text, user: req.user._id });
    await recalcStats(targetType, target);

    const populated = await review.populate("user", "name");
    res.status(201).json({ success: true, message: "Review submitted.", data: populated });
  } catch (err) {
    next(err);
  }
}

export async function getReviewsForTarget(req, res, next) {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [reviews, total, ratings] = await Promise.all([
      Review.find({ targetType, target: targetId })
        .populate("user", "name")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Review.countDocuments({ targetType, target: targetId }),
      // Ratings are stored separately from Reviews (a viewer can rate
      // without writing text), so join them here by user for display —
      // each review in the UI should show that reviewer's star score too.
      Rating.find({ targetType, target: targetId }, "user score"),
    ]);

    const scoreByUser = new Map(ratings.map((r) => [String(r.user), r.score]));
    const data = reviews.map((review) => ({
      ...review.toObject(),
      score: scoreByUser.get(String(review.user?._id || review.user)) ?? null,
    }));

    res.json({ success: true, count: data.length, total, page: pageNum, data });
  } catch (err) {
    next(err);
  }
}

// Owner can edit their own review. Admins are not allowed to edit
// (moderation is delete-only — see deleteReview) to avoid ever putting
// words in a user's mouth.
export async function updateReview(req, res, next) {
  try {
    const msg = firstValidationError(req);
    if (msg) return res.status(400).json({ success: false, message: msg });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own review." });
    }

    review.text = req.body.text;
    await review.save();

    res.json({ success: true, message: "Review updated.", data: review });
  } catch (err) {
    next(err);
  }
}

// Owner can delete their own review; admin can delete any review (moderation).
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    const isOwner = String(review.user) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can't delete someone else's review." });
    }

    await review.deleteOne();
    await recalcStats(review.targetType, review.target);

    res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    next(err);
  }
}

export async function getMyReviews(req, res, next) {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort("-createdAt")
      // refPath-driven populate resolves to Employee or Project per-document;
      // the nested populate only applies where the target actually has a
      // `user` field (Employee), so it's a no-op for Project targets.
      .populate({ path: "target", populate: { path: "user", select: "name" } });

    const targetIds = reviews.map((r) => r.target?._id).filter(Boolean);
    const ratings = await Rating.find(
      { user: req.user._id, target: { $in: targetIds } },
      "target score"
    );
    const scoreByTarget = new Map(ratings.map((r) => [String(r.target), r.score]));

    const data = reviews.map((review) => ({
      ...review.toObject(),
      score: scoreByTarget.get(String(review.target?._id || review.target)) ?? null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}
