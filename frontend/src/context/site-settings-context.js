import { createContext } from "react";

// Mirrors backend/src/models/Settings.js DEFAULT_SETTINGS. Used until the
// real settings load (and as a fallback if the request fails), so the site
// always has sane values to render with.
export const DEFAULT_SETTINGS = {
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  darkFontColor: "#E7E9F5",
  darkBackgroundColor: "#090E1B",
  lightFontColor: "#1A1D30",
  lightBackgroundColor: "#F7F8FC",
  imageWidth: 300,
  imageHeight: 200,
  borderRadius: 8,
  padding: 16,
  margin: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  cardWidth: 320,
  cardHeight: 380,
  cardBorderRadius: 16,
  profileWidth: 280,
  profileHeight: 280,
  profileBorderRadius: 9999,
};

export const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  reload: () => {},
});
