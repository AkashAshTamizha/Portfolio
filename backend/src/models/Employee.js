import mongoose from "mongoose";

const skillRefSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["linkedin", "github", "twitter", "website", "dribbble", "behance", "instagram", "other"],
      required: true,
    },
    url: { type: String, trim: true, maxlength: 500, required: true },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true, maxlength: 200 },
    degree: { type: String, required: true, trim: true, maxlength: 150 },
    field: { type: String, trim: true, maxlength: 150, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String, trim: true, maxlength: 60, default: "" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    issuer: { type: String, required: true, trim: true, maxlength: 150 },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialId: { type: String, trim: true, maxlength: 120, default: "" },
    credentialUrl: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: true }
);

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeCode: { type: String, required: true, unique: true, trim: true, maxlength: 30 },
    photo: { type: String, trim: true, default: "" },
    about: { type: String, trim: true, maxlength: 2000, default: "" },
    designation: { type: String, trim: true, maxlength: 150, default: "" },
    experience: { type: Number, min: 0, default: 0 }, // years
    skills: { type: [skillRefSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
    contact: {
      phone: { type: String, trim: true, maxlength: 30, default: "" },
      location: { type: String, trim: true, maxlength: 200, default: "" },
      availability: { type: String, trim: true, maxlength: 160, default: "" },
    },
    resume: {
      fileName: { type: String, default: "" },
      originalName: { type: String, default: "" },
      url: { type: String, default: "" },
      uploadedAt: { type: Date },
    },
    joinedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Denormalized aggregates, recomputed whenever a Rating/Review targeting
    // this employee changes (see utils/recalcStats.js). Keeps profile reads
    // to a single document fetch instead of a live aggregation every time.
    stats: {
      totalProjects: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

employeeSchema.index({ employeeCode: "text", designation: "text" });

// Convenience virtual so controllers/serializers can pull name/email/photo
// straight off the employee doc after a .populate("user").
employeeSchema.virtual("name").get(function getName() {
  return this.user?.name;
});
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

export default mongoose.model("Employee", employeeSchema);
