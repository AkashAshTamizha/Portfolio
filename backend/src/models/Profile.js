import mongoose from "mongoose";

// Singleton document — only one Profile ever exists (enforced in the controller).
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120, default: "" },
    initials: { type: String, trim: true, maxlength: 6, default: "" },
    role: { type: String, trim: true, maxlength: 160, default: "" },
    tagline: { type: String, trim: true, maxlength: 300, default: "" },
    bio: { type: String, trim: true, maxlength: 4000, default: "" },
    heroTyped: { type: [String], default: [] },
    specializations: { type: [String], default: [] },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    location: { type: String, trim: true, maxlength: 160, default: "" },
    yearsExperience: { type: Number, min: 0, max: 80, default: 0 },
    availability: { type: String, trim: true, maxlength: 160, default: "" },
    avatar: { type: String, trim: true, default: "" },
    resumeUrl: { type: String, trim: true, default: "" },
    socials: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
