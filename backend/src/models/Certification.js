import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    issuer: { type: String, required: true, trim: true, maxlength: 150 },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String, trim: true, maxlength: 120, default: "" },
    credentialUrl: { type: String, trim: true, maxlength: 500, default: "" },
    image: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

certificationSchema.index({ name: "text", issuer: "text" });

export default mongoose.model("Certification", certificationSchema);
