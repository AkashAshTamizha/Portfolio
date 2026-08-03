import { validationResult } from "express-validator";
import Settings, { DEFAULT_SETTINGS } from "../models/Settings.js";

// Settings is a singleton — there is only ever one document. This helper
// fetches it, creating it (with schema defaults) on first ever request so
// the frontend never has to special-case a "no settings yet" state.
async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

// GET /api/settings — public read so the live site can apply the saved
// appearance; no auth required (matches getProfile/getContactInfo).
export async function getSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings — admin-only. Validates the full set of appearance
// fields and saves them onto the single Settings document.
export async function updateSettings(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const settings = await getOrCreateSettings();

    // Only ever touch known appearance fields — never spread req.body
    // directly onto the document, so an attacker can't smuggle in
    // unexpected keys (e.g. trying to overwrite _id or timestamps).
    const fields = [
      "fontSize",
      "fontFamily",
      "darkFontColor",
      "darkBackgroundColor",
      "lightFontColor",
      "lightBackgroundColor",
      "imageWidth",
      "imageHeight",
      "borderRadius",
      "padding",
      "margin",
      "lineHeight",
      "letterSpacing",
      "cardWidth",
      "cardHeight",
      "cardBorderRadius",
      "profileWidth",
      "profileHeight",
      "profileBorderRadius",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });

    await settings.save();
    res.json({ success: true, message: "Settings saved successfully.", data: settings });
  } catch (err) {
    next(err);
  }
}

// POST /api/settings/reset — admin-only. Restores every field to its
// factory default (DEFAULT_SETTINGS), without deleting/recreating the
// document, so its _id and createdAt stay stable.
export async function resetSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    settings.set(DEFAULT_SETTINGS);
    await settings.save();
    res.json({ success: true, message: "Settings reset to defaults.", data: settings });
  } catch (err) {
    next(err);
  }
}
