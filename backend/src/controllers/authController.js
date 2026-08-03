import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// Lets the frontend know whether the first-run setup form should be shown.
// Only ever true when the User collection is completely empty.
export async function setupStatus(req, res, next) {
  try {
    const count = await User.countDocuments({ role: "admin" });
    res.json({ success: true, data: { setupRequired: count === 0 } });
  } catch (err) {
    next(err);
  }
}

// Creates the very first admin account from the UI. Deliberately locks
// itself out the moment ANY user exists, so it can never be used to create
// a second/rogue admin later — after that, admins can only be added via
// `npm run seed` (server-side, .env-gated) by design.
export async function setupAdmin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const existingCount = await User.countDocuments({ role: "admin" });
    if (existingCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Setup has already been completed. Use the login page or contact an existing admin.",
      });
    }

    const { name, email, password } = req.body;
    const user = await User.create({ name, email: email.toLowerCase(), password, role: "admin" });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "Admin account created.", token, user: sanitizeUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }
    next(err);
  }
}

// Public self-signup for "Registered User" accounts only. `role` is never
// read from the request body — always forced to "user" server-side — so
// this endpoint can never be used to mint an admin or employee account.
export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const user = await User.create({ name, email: email.toLowerCase(), password, role: "user" });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "Account created.", token, user: sanitizeUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "This account has been deactivated." });
    }

    const token = generateToken(user._id);
    res.json({ success: true, message: "Logged in successfully.", token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({ success: true, data: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with the same message whether or not the account exists,
    // so the endpoint can't be used to enumerate registered admin emails.
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const clientOrigin = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0].trim();
    const resetUrl = `${clientOrigin}/admin/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (mailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("[mail] Failed to send reset email:", mailErr.message);
      return res.status(500).json({ success: false, message: "Could not send reset email. Please try again later." });
    }

    return res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired." });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: "Password reset successfully.", token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}
