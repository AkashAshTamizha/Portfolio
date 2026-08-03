import { body } from "express-validator";

// ---------- Auth ----------
export const loginValidationRules = [
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Enter a valid email."),
  body("password").notEmpty().withMessage("Password is required."),
];

export const setupValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Enter a valid email."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

export const forgotPasswordValidationRules = [
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Enter a valid email."),
];

export const resetPasswordValidationRules = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

export const updatePasswordValidationRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters long."),
];

// ---------- Profile ----------
export const profileValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("initials")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 6 })
    .withMessage("Initials must be 6 characters or fewer."),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Enter a valid email."),
];

// ---------- Skills ----------
export const skillValidationRules = [
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("name").trim().notEmpty().withMessage("Skill name is required."),
  body("level").isInt({ min: 1, max: 5 }).withMessage("Level must be between 1 and 5."),
];

// ---------- Services ----------
export const serviceValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
];

// ---------- Experience ----------
export const experienceValidationRules = [
  body("company").trim().notEmpty().withMessage("Company is required."),
  body("role").trim().notEmpty().withMessage("Role is required."),
  body("startDate").notEmpty().withMessage("Start date is required.").isISO8601().withMessage("Enter a valid start date."),
];

// ---------- Education ----------
export const educationValidationRules = [
  body("institution").trim().notEmpty().withMessage("Institution is required."),
  body("degree").trim().notEmpty().withMessage("Degree is required."),
  body("startDate").notEmpty().withMessage("Start date is required.").isISO8601().withMessage("Enter a valid start date."),
];

// ---------- Certifications ----------
export const certificationValidationRules = [
  body("name").trim().notEmpty().withMessage("Certification name is required."),
  body("issuer").trim().notEmpty().withMessage("Issuer is required."),
  body("issueDate").notEmpty().withMessage("Issue date is required.").isISO8601().withMessage("Enter a valid issue date."),
];

// ---------- Contact Info ----------
export const contactInfoValidationRules = [
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Enter a valid email."),
];

// ---------- Projects ----------
export const projectValidationRules = [
  body("name").trim().notEmpty().withMessage("Project name is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
];

// ---------- Registered users (public sign-up) ----------
export const registerValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Enter a valid email."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
];

// ---------- Employees ----------
export const employeeCreateValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Enter a valid email."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
  body("employeeCode").trim().notEmpty().withMessage("Employee code is required.").isLength({ max: 30 }),
  body("designation").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body("experience").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Experience must be a positive number."),
];

export const employeeUpdateValidationRules = [
  body("designation").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body("experience").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Experience must be a positive number."),
  body("about").optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
];

// ---------- Tasks ----------
export const taskValidationRules = [
  body("title").trim().notEmpty().withMessage("Task title is required.").isLength({ max: 200 }),
  body("employee").trim().notEmpty().withMessage("An employee must be assigned."),
  body("dueDate").optional({ checkFalsy: true }).isISO8601().withMessage("Enter a valid due date."),
];

export const taskProgressValidationRules = [
  body("progress").isInt({ min: 0, max: 100 }).withMessage("Progress must be between 0 and 100."),
];

// ---------- Ratings & Reviews ----------
export const ratingValidationRules = [
  body("targetType").isIn(["employee", "project"]).withMessage("targetType must be 'employee' or 'project'."),
  body("target").trim().notEmpty().withMessage("target id is required."),
  body("score").isInt({ min: 1, max: 5 }).withMessage("Score must be between 1 and 5."),
];

export const reviewValidationRules = [
  body("targetType").isIn(["employee", "project"]).withMessage("targetType must be 'employee' or 'project'."),
  body("target").trim().notEmpty().withMessage("target id is required."),
  body("text").trim().isLength({ min: 3, max: 2000 }).withMessage("Review must be between 3 and 2000 characters."),
];

// Editing an existing review only ever changes its text — targetType/target
// are immutable once the review is created, so (unlike create) they aren't
// expected in the PUT body and must not be required here.
export const reviewUpdateValidationRules = [
  body("text").trim().isLength({ min: 3, max: 2000 }).withMessage("Review must be between 3 and 2000 characters."),
];

// ---------- Attendance ----------
export const attendanceValidationRules = [
  body("employee").trim().notEmpty().withMessage("Employee is required."),
  body("date").notEmpty().withMessage("Date is required.").isISO8601().withMessage("Enter a valid date."),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(["present", "absent", "half_day", "on_leave"])
    .withMessage("Invalid status."),
];

// ---------- Leave ----------
export const leaveValidationRules = [
  body("leaveType")
    .optional({ checkFalsy: true })
    .isIn(["casual", "sick", "earned", "unpaid", "other"])
    .withMessage("Invalid leave type."),
  body("startDate").notEmpty().withMessage("Start date is required.").isISO8601().withMessage("Enter a valid start date."),
  body("endDate").notEmpty().withMessage("End date is required.").isISO8601().withMessage("Enter a valid end date."),
  body("reason").trim().notEmpty().withMessage("Reason is required.").isLength({ max: 1000 }),
];

// ---------- Site Appearance Settings ----------
// Every field is optional() here because updateSettings only applies keys
// that are actually present in the body (partial updates are allowed), but
// whichever fields ARE sent must satisfy the same bounds as the Settings
// model itself — kept in sync manually since express-validator and
// Mongoose schema validation are two separate systems.
const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const settingsValidationRules = [
  body("fontSize")
    .optional()
    .isFloat({ min: 8, max: 72 })
    .withMessage("Font size must be between 8 and 72px."),
  body("fontFamily")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Font family is too long."),
  body("darkFontColor")
    .optional({ checkFalsy: true })
    .trim()
    .matches(HEX_COLOR_PATTERN)
    .withMessage("Dark theme font color must be a valid hex color (e.g. #E7E9F5)."),
  body("darkBackgroundColor")
    .optional({ checkFalsy: true })
    .trim()
    .matches(HEX_COLOR_PATTERN)
    .withMessage("Dark theme background color must be a valid hex color (e.g. #090E1B)."),
  body("lightFontColor")
    .optional({ checkFalsy: true })
    .trim()
    .matches(HEX_COLOR_PATTERN)
    .withMessage("Light theme font color must be a valid hex color (e.g. #1A1D30)."),
  body("lightBackgroundColor")
    .optional({ checkFalsy: true })
    .trim()
    .matches(HEX_COLOR_PATTERN)
    .withMessage("Light theme background color must be a valid hex color (e.g. #F7F8FC)."),
  body("imageWidth")
    .optional()
    .isFloat({ min: 1, max: 4000 })
    .withMessage("Image width must be between 1 and 4000px."),
  body("imageHeight")
    .optional()
    .isFloat({ min: 1, max: 4000 })
    .withMessage("Image height must be between 1 and 4000px."),
  body("borderRadius")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Border radius must be between 0 and 200px."),
  body("padding")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Padding must be between 0 and 200px."),
  body("margin")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Margin must be between 0 and 200px."),
  body("lineHeight")
    .optional()
    .isFloat({ min: 0.5, max: 4 })
    .withMessage("Line height must be between 0.5 and 4."),
  body("letterSpacing")
    .optional()
    .isFloat({ min: -5, max: 20 })
    .withMessage("Letter spacing must be between -5 and 20px."),
  body("cardWidth")
    .optional()
    .isFloat({ min: 120, max: 1200 })
    .withMessage("Card width must be between 120 and 1200px."),
  body("cardHeight")
    .optional()
    .isFloat({ min: 120, max: 1200 })
    .withMessage("Card height must be between 120 and 1200px."),
  body("cardBorderRadius")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Card border radius must be between 0 and 200px."),
  body("profileWidth")
    .optional()
    .isFloat({ min: 60, max: 800 })
    .withMessage("Profile width must be between 60 and 800px."),
  body("profileHeight")
    .optional()
    .isFloat({ min: 60, max: 800 })
    .withMessage("Profile height must be between 60 and 800px."),
  body("profileBorderRadius")
    .optional()
    .isFloat({ min: 0, max: 9999 })
    .withMessage("Profile border radius must be between 0 and 9999px."),
];

export const contactValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 120 })
    .withMessage("Name is too long."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required.")
    .isLength({ max: 200 })
    .withMessage("Subject is too long."),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message should be between 10 and 5000 characters."),
];
