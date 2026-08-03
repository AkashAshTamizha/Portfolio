import mongoose from "mongoose";

// Reused by both the Mongoose-level validators below and the express-validator
// rules in middleware/validators.js, so "what counts as a valid hex color"
// only has to be defined once.
export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// Central place for defaults so the model, the "reset to defaults" endpoint,
// and the seed script all stay in sync automatically instead of drifting.
export const DEFAULT_SETTINGS = {
  fontSize: 16, // px
  fontFamily: "Inter, sans-serif",
  darkFontColor: "#E7E9F5",
  darkBackgroundColor: "#090E1B",
  lightFontColor: "#1A1D30",
  lightBackgroundColor: "#F7F8FC",
  imageWidth: 300, // px
  imageHeight: 200, // px
  borderRadius: 8, // px
  padding: 16, // px
  margin: 16, // px
  lineHeight: 1.5, // unitless multiplier
  letterSpacing: 0, // px
  cardWidth: 320, // px — applied as max-width on .settings-card
  cardHeight: 380, // px — applied as min-height on .settings-card (content can still grow taller)
  cardBorderRadius: 16, // px
  profileWidth: 280, // px
  profileHeight: 280, // px
  profileBorderRadius: 9999, // px — 9999 = fully round (circle), 0 = square corners
};


// Site appearance is a singleton document — there is only ever one Settings
// row, the same pattern already used for Profile and ContactInfo. Getting
// the settings creates this document (with defaults) on first read; saving
// always updates the same document rather than creating new ones.
const settingsSchema = new mongoose.Schema(
  {
    fontSize: {
      type: Number,
      min: [8, "Font size must be at least 8px."],
      max: [72, "Font size must be 72px or smaller."],
      default: DEFAULT_SETTINGS.fontSize,
    },
    fontFamily: {
      type: String,
      trim: true,
      maxlength: 200,
      default: DEFAULT_SETTINGS.fontFamily,
    },
    darkFontColor: {
      type: String,
      trim: true,
      uppercase: true,
      match: [HEX_COLOR_REGEX, "Dark theme font color must be a valid hex color (e.g. #E7E9F5)."],
      default: DEFAULT_SETTINGS.darkFontColor,
    },
    darkBackgroundColor: {
      type: String,
      trim: true,
      uppercase: true,
      match: [HEX_COLOR_REGEX, "Dark theme background color must be a valid hex color (e.g. #090E1B)."],
      default: DEFAULT_SETTINGS.darkBackgroundColor,
    },
    lightFontColor: {
      type: String,
      trim: true,
      uppercase: true,
      match: [HEX_COLOR_REGEX, "Light theme font color must be a valid hex color (e.g. #1A1D30)."],
      default: DEFAULT_SETTINGS.lightFontColor,
    },
    lightBackgroundColor: {
      type: String,
      trim: true,
      uppercase: true,
      match: [HEX_COLOR_REGEX, "Light theme background color must be a valid hex color (e.g. #F7F8FC)."],
      default: DEFAULT_SETTINGS.lightBackgroundColor,
    },
    imageWidth: {
      type: Number,
      min: [1, "Image width must be at least 1px."],
      max: [4000, "Image width must be 4000px or smaller."],
      default: DEFAULT_SETTINGS.imageWidth,
    },
    imageHeight: {
      type: Number,
      min: [1, "Image height must be at least 1px."],
      max: [4000, "Image height must be 4000px or smaller."],
      default: DEFAULT_SETTINGS.imageHeight,
    },
    borderRadius: {
      type: Number,
      min: [0, "Border radius can't be negative."],
      max: [200, "Border radius must be 200px or smaller."],
      default: DEFAULT_SETTINGS.borderRadius,
    },
    padding: {
      type: Number,
      min: [0, "Padding can't be negative."],
      max: [200, "Padding must be 200px or smaller."],
      default: DEFAULT_SETTINGS.padding,
    },
    margin: {
      type: Number,
      min: [0, "Margin can't be negative."],
      max: [200, "Margin must be 200px or smaller."],
      default: DEFAULT_SETTINGS.margin,
    },
    lineHeight: {
      type: Number,
      min: [0.5, "Line height must be at least 0.5."],
      max: [4, "Line height must be 4 or smaller."],
      default: DEFAULT_SETTINGS.lineHeight,
    },
    letterSpacing: {
      type: Number,
      min: [-5, "Letter spacing must be -5px or greater."],
      max: [20, "Letter spacing must be 20px or smaller."],
      default: DEFAULT_SETTINGS.letterSpacing,
    },
    cardWidth: {
      type: Number,
      min: [120, "Card width must be at least 120px."],
      max: [1200, "Card width must be 1200px or smaller."],
      default: DEFAULT_SETTINGS.cardWidth,
    },
    cardHeight: {
      type: Number,
      min: [120, "Card height must be at least 120px."],
      max: [1200, "Card height must be 1200px or smaller."],
      default: DEFAULT_SETTINGS.cardHeight,
    },
    cardBorderRadius: {
      type: Number,
      min: [0, "Card border radius can't be negative."],
      max: [200, "Card border radius must be 200px or smaller."],
      default: DEFAULT_SETTINGS.cardBorderRadius,
    },
    profileWidth: {
      type: Number,
      min: [60, "Profile width must be at least 60px."],
      max: [800, "Profile width must be 800px or smaller."],
      default: DEFAULT_SETTINGS.profileWidth,
    },
    profileHeight: {
      type: Number,
      min: [60, "Profile height must be at least 60px."],
      max: [800, "Profile height must be 800px or smaller."],
      default: DEFAULT_SETTINGS.profileHeight,
    },
    profileBorderRadius: {
      type: Number,
      min: [0, "Profile border radius can't be negative."],
      max: [9999, "Profile border radius must be 9999px or smaller."],
      default: DEFAULT_SETTINGS.profileBorderRadius,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
