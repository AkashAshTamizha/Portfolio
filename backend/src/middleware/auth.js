import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the Bearer JWT on protected routes and attaches the admin user
// (without password) to req.user.
export async function protect(req, res, next) {
  try {
    let token;
    const header = req.headers.authorization;

    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User for this token no longer exists." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "This account has been deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
}
