import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "blocked"],
      default: "todo",
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ employee: 1, status: 1 });

// Keep status/progress in sync so the two never contradict each other
// (e.g. progress=100 but status still "todo").
taskSchema.pre("save", function syncStatusAndProgress() {
  if (this.progress >= 100) this.status = "completed";
  else if (this.progress > 0 && this.status === "todo") this.status = "in_progress";
});

export default mongoose.model("Task", taskSchema);
