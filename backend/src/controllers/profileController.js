import { validationResult } from "express-validator";
import Profile from "../models/Profile.js";

// Profile is a singleton — getProfile creates an empty one on first read,
// updateProfile always upserts the same document.
export async function getProfile(req, res, next) {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile.set(req.body);
      await profile.save();
    }

    res.json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (err) {
    next(err);
  }
}
