import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["employee", "project"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    targetModel: { type: String, required: true, enum: ["Employee", "Project"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, minlength: 3, maxlength: 2000 },
  },
  { timestamps: true }
);

// One review per user per target — they edit it instead of stacking more.
reviewSchema.index({ targetType: 1, target: 1, user: 1 }, { unique: true });

reviewSchema.pre("validate", function setTargetModel() {
  this.targetModel = this.targetType === "employee" ? "Employee" : "Project";
});

export default mongoose.model("Review", reviewSchema);
