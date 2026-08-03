import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    // Normalized to midnight — one record per employee per calendar day.
    date: { type: Date, required: true },
    punchIn: { type: Date, default: null },
    punchOut: { type: Date, default: null },
    workedHours: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "on_leave"],
      default: "present",
    },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
