import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 150 },
    role: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, trim: true, maxlength: 150, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    achievements: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

experienceSchema.index({ company: "text", role: "text" });

export default mongoose.model("Experience", experienceSchema);
