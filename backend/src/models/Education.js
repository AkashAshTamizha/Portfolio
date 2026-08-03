import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true, maxlength: 200 },
    degree: { type: String, required: true, trim: true, maxlength: 150 },
    field: { type: String, trim: true, maxlength: 150, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    grade: { type: String, trim: true, maxlength: 60, default: "" },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

educationSchema.index({ institution: "text", degree: "text", field: "text" });

export default mongoose.model("Education", educationSchema);
