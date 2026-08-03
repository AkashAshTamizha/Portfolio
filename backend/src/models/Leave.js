import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveType: {
      type: String,
      enum: ["casual", "sick", "earned", "unpaid", "other"],
      default: "casual",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
    // Inclusive day count, derived from startDate/endDate.
    days: { type: Number, default: 1 },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, status: 1 });

leaveSchema.pre("validate", function computeDays() {
  if (this.startDate && this.endDate) {
    const diff = Math.round((this.endDate - this.startDate) / 86400000) + 1;
    this.days = diff > 0 ? diff : 1;
  }
});

export default mongoose.model("Leave", leaveSchema);
