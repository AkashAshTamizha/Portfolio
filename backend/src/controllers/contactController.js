import { validationResult } from "express-validator";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";
import { sendContactNotification } from "../utils/mailer.js";

export async function submitContactMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, subject, message } = req.body;

    // Persist to DB only if connected (keeps the demo usable without Mongo configured)
    if (mongoose.connection.readyState === 1) {
      await ContactMessage.create({
        name,
        email,
        subject,
        message,
        ip: req.ip,
      });
    }

    // Fire-and-forget email notification; don't fail the request if email fails
    sendContactNotification({ name, email, subject, message }).catch((err) =>
      console.error("[mail] Failed to send notification:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Message received. Thanks for reaching out!",
    });
  } catch (err) {
    next(err);
  }
}
