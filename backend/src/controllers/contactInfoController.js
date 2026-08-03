import { validationResult } from "express-validator";
import ContactInfo from "../models/ContactInfo.js";

export async function getContactInfo(req, res, next) {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create({});
    }
    res.json({ success: true, data: info });
  } catch (err) {
    next(err);
  }
}

export async function updateContactInfo(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create(req.body);
    } else {
      info.set(req.body);
      await info.save();
    }

    res.json({ success: true, message: "Contact information updated successfully.", data: info });
  } catch (err) {
    next(err);
  }
}
