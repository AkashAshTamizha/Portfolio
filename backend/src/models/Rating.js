import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["employee", "project"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    targetModel: { type: String, required: true, enum: ["Employee", "Project"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

// One rating per user per target — resubmitting updates the existing one
// instead of creating a duplicate.
ratingSchema.index({ targetType: 1, target: 1, user: 1 }, { unique: true });

// Derives targetModel from targetType so callers only ever need to pass
// targetType — keeps the refPath machinery invisible to the controller.
ratingSchema.pre("validate", function setTargetModel() {
  this.targetModel = this.targetType === "employee" ? "Employee" : "Project";
});

export default mongoose.model("Rating", ratingSchema);
