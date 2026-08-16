import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 150 },
    url: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    role: { type: String, trim: true, maxlength: 150, default: "" }, // e.g. "Lead Developer"
    contribution: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, trim: true, maxlength: 100, default: "" },
    year: { type: String, trim: true, maxlength: 20, default: "" },
    image: { type: String, trim: true, default: "" },
    gallery: { type: [String], default: [] },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    problem: { type: String, trim: true, maxlength: 2000, default: "" },
    features: { type: [String], default: [] },
    challenges: { type: String, trim: true, maxlength: 2000, default: "" },
    tech: { type: [String], default: [] },
    github: { type: String, trim: true, maxlength: 500, default: "" },
    demo: { type: String, trim: true, maxlength: 500, default: "" },
    documents: { type: [documentSchema], default: [] },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },

    // --- Portfolio Management additions ---
    client: { type: String, trim: true, maxlength: 200, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "on_hold"],
      default: "planned",
    },
    team: { type: [teamMemberSchema], default: [] },
    stats: {
      avgRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

projectSchema.index({ name: "text", category: "text", description: "text", tech: "text" });
// Powers "all projects an employee worked on" without a separate join table.
projectSchema.index({ "team.employee": 1 });

export default mongoose.model("Project", projectSchema);
