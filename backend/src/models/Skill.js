import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, maxlength: 100 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    level: { type: Number, required: true, min: 1, max: 5, default: 3 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

skillSchema.index({ category: "text", name: "text" });

export default mongoose.model("Skill", skillSchema);
