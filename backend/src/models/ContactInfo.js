import mongoose from "mongoose";

// Singleton document — only one ContactInfo ever exists.
const contactInfoSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    location: { type: String, trim: true, maxlength: 200, default: "" },
    availability: { type: String, trim: true, maxlength: 160, default: "" },
    mapUrl: { type: String, trim: true, maxlength: 500, default: "" },
    socials: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ContactInfo", contactInfoSchema);
