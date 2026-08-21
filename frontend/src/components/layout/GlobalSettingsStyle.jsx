import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../../hooks/useSiteSettings";

// This is what actually makes the Admin Settings page "do" something on the
// public site. It doesn't (and can't, without a much larger design-token
// refactor) recolor every individual accent/button — this codebase styles
// most elements with explicit Tailwind utility classes (text-cloud-100,
// bg-ink-800, etc.), not by inheriting from the page defaults. What it DOES
// reliably control, site-wide:
//   - font family, size, line-height, letter-spacing for body text
//   - every card's corner radius + inner spacing (.card-surface is the one
//     shared class every card component already uses)
//   - default rendered size for content images that opt in via the
//     `.settings-image` class (see ProjectCard)
//   - width/height/corner radius for content cards that opt in via the
//     `.settings-card` class (see ProjectCard)
//   - width/height/corner radius for the profile photo via the
//     `.settings-profile` / `.settings-profile-mask` classes (see HeroPhoto)
//   - page background + base text color, PER THEME — see note below
//
// NOTE on colors: this file used to force a single `body { background-color;
// color }` with `!important`, which unconditionally beat the light/dark
// theme's own `body` rules in index.css no matter which theme was active —
// so toggleTheme() *was* switching state correctly, but the color never
// visibly changed because this override always won regardless of theme.
//
// Fix: the admin now sets FOUR colors instead of two — a font/background
// pair for dark mode and a separate pair for light mode. Each pair is only
// applied under its matching `html.dark` / `html.light` selector, so the
// active theme always decides which pair is showing. The toggle and the
// admin's color settings now cooperate instead of fighting.
export default function GlobalSettingsStyle() {
  const { settings } = useSiteSettings();

  
  const css = `
    :root {
      --settings-font-size: ${settings.fontSize}px;
      --settings-font-family: ${settings.fontFamily};
      --settings-border-radius: ${settings.borderRadius}px;
      --settings-padding: ${settings.padding}px;
      --settings-margin: ${settings.margin}px;
      --settings-line-height: ${settings.lineHeight};
      --settings-letter-spacing: ${settings.letterSpacing}px;
      --settings-image-width: ${settings.imageWidth}px;
      --settings-image-height: ${settings.imageHeight}px;
      --settings-card-width: ${settings.cardWidth}px;
      --settings-card-height: ${settings.cardHeight}px;
      --settings-card-radius: ${settings.cardBorderRadius}px;
      --settings-profile-width: ${settings.profileWidth}px;
      --settings-profile-height: ${settings.profileHeight}px;
      --settings-profile-radius: ${settings.profileBorderRadius}px;
      --settings-dark-font-color: ${settings.darkFontColor};
      --settings-dark-bg-color: ${settings.darkBackgroundColor};
      --settings-light-font-color: ${settings.lightFontColor};
      --settings-light-bg-color: ${settings.lightBackgroundColor};
    }
    body {
      font-family: var(--settings-font-family) !important;
      font-size: var(--settings-font-size) !important;
      line-height: var(--settings-line-height) !important;
      letter-spacing: var(--settings-letter-spacing) !important;
    }
    html.dark body {
      background-color: var(--settings-dark-bg-color) !important;
      color: var(--settings-dark-font-color) !important;
    }
    html.light body {
      background-color: var(--settings-light-bg-color) !important;
      color: var(--settings-light-font-color) !important;
    }
    .card-surface {
      border-radius: var(--settings-border-radius) !important;
      padding: var(--settings-padding) !important;
      margin-bottom: var(--settings-margin) !important;
    }
    .settings-image {
      width: 100%;
      max-width: var(--settings-image-width) !important;
      height: var(--settings-image-height) !important;
      border-radius: var(--settings-border-radius) !important;
      object-fit: cover;
    }
    .settings-card {
      width: 100%;
      max-width: var(--settings-card-width) !important;
      min-height: var(--settings-card-height) !important;
      border-radius: var(--settings-card-radius) !important;
    }
    .settings-profile {
      width: var(--settings-profile-width) !important;
      height: var(--settings-profile-height) !important;
    }
    .settings-profile-mask {
      border-radius: var(--settings-profile-radius) !important;
    }
  `;

  return (
    <Helmet>
      <style id="site-settings-overrides">{css}</style>
    </Helmet>
  );
}
