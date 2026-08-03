import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuRotateCcw, LuX, LuSave, LuPalette } from "react-icons/lu";
import { api } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import { DEFAULT_SETTINGS } from "../../context/site-settings-context";

// A handful of common, widely-available font stacks. The site already
// loads Inter/Space Grotesk/JetBrains Mono via Google Fonts (see index.css);
// the others are system fonts so they render correctly without extra
// <link> tags.
const FONT_FAMILY_OPTIONS = [
  { label: "Inter (sans-serif)", value: "Inter, sans-serif" },
  { label: "Space Grotesk (display)", value: "'Space Grotesk', sans-serif" },
  { label: "JetBrains Mono (monospace)", value: "'JetBrains Mono', monospace" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New (monospace)", value: "'Courier New', Courier, monospace" },
];

// Declarative field config drives both validation and the min/max shown on
// each slider — keeps the two from drifting apart. Bounds mirror the
// backend's settingsValidationRules exactly.
const FIELD_META = {
  fontSize: { label: "Font Size", unit: "px", min: 8, max: 72, step: 1 },
  imageWidth: { label: "Image Width", unit: "px", min: 1, max: 4000, step: 1 },
  imageHeight: { label: "Image Height", unit: "px", min: 1, max: 4000, step: 1 },
  borderRadius: { label: "Border Radius", unit: "px", min: 0, max: 200, step: 1 },
  padding: { label: "Padding", unit: "px", min: 0, max: 200, step: 1 },
  margin: { label: "Margin", unit: "px", min: 0, max: 200, step: 1 },
  lineHeight: { label: "Line Height", unit: "", min: 0.5, max: 4, step: 0.1 },
  letterSpacing: { label: "Letter Spacing", unit: "px", min: -5, max: 20, step: 0.5 },
  cardWidth: { label: "Card Width", unit: "px", min: 120, max: 1200, step: 1 },
  cardHeight: { label: "Card Height", unit: "px", min: 120, max: 1200, step: 1 },
  cardBorderRadius: { label: "Card Shape (radius)", unit: "px", min: 0, max: 200, step: 1 },
  profileWidth: { label: "Profile Width", unit: "px", min: 60, max: 800, step: 1 },
  profileHeight: { label: "Profile Height", unit: "px", min: 60, max: 800, step: 1 },
  profileBorderRadius: { label: "Profile Shape (radius)", unit: "px", min: 0, max: 9999, step: 1 },
};

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const COLOR_FIELDS = [
  { name: "darkFontColor", label: "Dark Theme Font Color" },
  { name: "darkBackgroundColor", label: "Dark Theme Background Color" },
  { name: "lightFontColor", label: "Light Theme Font Color" },
  { name: "lightBackgroundColor", label: "Light Theme Background Color" },
];

// Validates the full settings object against the same bounds the backend
// enforces, so bad input is caught immediately instead of round-tripping
// to the server first. Returns a { fieldName: message } map.
function validate(values) {
  const errors = {};
  Object.entries(FIELD_META).forEach(([name, meta]) => {
    const raw = values[name];
    if (raw === "" || raw === null || raw === undefined || Number.isNaN(Number(raw))) {
      errors[name] = `${meta.label} is required.`;
    } else if (Number(raw) < meta.min || Number(raw) > meta.max) {
      errors[name] = `${meta.label} must be between ${meta.min} and ${meta.max}${meta.unit}.`;
    }
  });
  COLOR_FIELDS.forEach(({ name, label }) => {
    if (!HEX_COLOR_REGEX.test(values[name] || "")) {
      errors[name] = `Enter a valid hex color for ${label} (e.g. #1A1D29).`;
    }
  });
  if (!values.fontFamily) {
    errors.fontFamily = "Select a font family.";
  }
  return errors;
}

// A slider + number input pair, kept in sync with each other and writing
// numeric values back to the parent form state.
function RangeField({ name, value, onChange, error }) {
  const meta = FIELD_META[name];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={name} className="block text-sm font-medium text-cloud-300">
          {meta.label}
        </label>
        <span className="text-xs text-cloud-500 font-mono">
          {value}
          {meta.unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={Number.isFinite(Number(value)) ? value : meta.min}
          onChange={(e) => onChange(name, Number(e.target.value))}
          className="flex-1 accent-blue-400"
          aria-label={meta.label}
        />
        <input
          id={name}
          type="number"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={value}
          onChange={(e) => onChange(name, e.target.value === "" ? "" : Number(e.target.value))}
          className="w-20 rounded-lg bg-ink-900 border border-ink-600 px-2 py-1.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-coral-400">{error}</p>}
    </div>
  );
}

// A native color swatch synced with an editable hex text field, so admins
// can either pick visually or type/paste an exact hex value.
function ColorField({ name, label, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-cloud-300 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={HEX_COLOR_REGEX.test(value) ? value : "#000000"}
          onChange={(e) => onChange(name, e.target.value.toUpperCase())}
          className="h-10 w-12 rounded-lg border border-ink-600 bg-ink-900 cursor-pointer shrink-0"
          aria-label={`${label} swatch`}
        />
        <input
          id={name}
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="#RRGGBB"
          className={`w-full rounded-lg bg-ink-900 border px-3 py-2 text-sm text-cloud-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            error ? "border-coral-500" : "border-ink-600"
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-coral-400">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState(DEFAULT_SETTINGS);
  const [savedValues, setSavedValues] = useState(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState("dark");

  const previewBgColor = previewTheme === "dark" ? values.darkBackgroundColor : values.lightBackgroundColor;
  const previewFontColor = previewTheme === "dark" ? values.darkFontColor : values.lightFontColor;

  // Load saved settings automatically on mount.
  useEffect(() => {
    let mounted = true;
    api
      .get("/settings")
      .then((res) => {
        if (!mounted) return;
        const data = { ...DEFAULT_SETTINGS, ...res.data };
        setValues(data);
        setSavedValues(data);
      })
      .catch((err) => toast.error(err.message || "Failed to load settings."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues);

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/settings", values);
      const data = { ...DEFAULT_SETTINGS, ...res.data };
      setValues(data);
      setSavedValues(data);
      toast.success("Settings saved successfully.");
    } catch (err) {
      if (err.errors?.length) {
        const fieldErrors = {};
        err.errors.forEach((e2) => {
          if (e2.path) fieldErrors[e2.path] = e2.msg;
        });
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  // Discards any unsaved edits, reverting the form to the last-saved values.
  function handleCancel() {
    setValues(savedValues);
    setErrors({});
    toast("Changes discarded.", { icon: "↩️" });
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await api.post("/settings/reset");
      const data = { ...DEFAULT_SETTINGS, ...res.data };
      setValues(data);
      setSavedValues(data);
      setErrors({});
      toast.success("Settings reset to defaults.");
    } catch (err) {
      toast.error(err.message || "Failed to reset settings.");
    } finally {
      setResetting(false);
      setConfirmResetOpen(false);
    }
  }

  if (loading) {
    return <div className="text-cloud-500 text-sm">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-400/15 text-blue-400 flex items-center justify-center shrink-0">
          <LuPalette className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-cloud-100">Site Appearance Settings</h1>
          <p className="text-sm text-cloud-400 mt-0.5">
            Control fonts, colors, spacing, and image sizing used across the site.
          </p>
        </div>
      </div>

      {/* Form + live preview side by side on large screens, stacked on mobile/tablet */}
      <form onSubmit={handleSave} className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          {/* Typography */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// typography"}</legend>
            <RangeField name="fontSize" value={values.fontSize} onChange={updateField} error={errors.fontSize} />
            <div>
              <label htmlFor="fontFamily" className="block text-sm font-medium text-cloud-300 mb-1.5">
                Font Family
              </label>
              <select
                id="fontFamily"
                value={values.fontFamily}
                onChange={(e) => updateField("fontFamily", e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.fontFamily ? "border-coral-500" : "border-ink-600"
                }`}
              >
                {FONT_FAMILY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.fontFamily && <p className="mt-1 text-xs text-coral-400">{errors.fontFamily}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <RangeField name="lineHeight" value={values.lineHeight} onChange={updateField} error={errors.lineHeight} />
              <RangeField
                name="letterSpacing"
                value={values.letterSpacing}
                onChange={updateField}
                error={errors.letterSpacing}
              />
            </div>
          </fieldset>

          {/* Colors */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// colors"}</legend>
            <p className="text-xs text-cloud-500 -mt-1">
              Set a separate color pair for each theme — the pair that applies switches automatically with the
              visitor&apos;s light/dark toggle.
            </p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cloud-500 mb-3">Dark theme</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <ColorField
                  name="darkFontColor"
                  label="Font Color"
                  value={values.darkFontColor}
                  onChange={updateField}
                  error={errors.darkFontColor}
                />
                <ColorField
                  name="darkBackgroundColor"
                  label="Background Color"
                  value={values.darkBackgroundColor}
                  onChange={updateField}
                  error={errors.darkBackgroundColor}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cloud-500 mb-3">Light theme</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <ColorField
                  name="lightFontColor"
                  label="Font Color"
                  value={values.lightFontColor}
                  onChange={updateField}
                  error={errors.lightFontColor}
                />
                <ColorField
                  name="lightBackgroundColor"
                  label="Background Color"
                  value={values.lightBackgroundColor}
                  onChange={updateField}
                  error={errors.lightBackgroundColor}
                />
              </div>
            </div>
          </fieldset>

          {/* Image dimensions */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// image-dimensions"}</legend>
            <div className="grid sm:grid-cols-2 gap-5">
              <RangeField name="imageWidth" value={values.imageWidth} onChange={updateField} error={errors.imageWidth} />
              <RangeField
                name="imageHeight"
                value={values.imageHeight}
                onChange={updateField}
                error={errors.imageHeight}
              />
            </div>
          </fieldset>

          {/* Card dimensions */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// card"}</legend>
            <div className="grid sm:grid-cols-3 gap-5">
              <RangeField name="cardWidth" value={values.cardWidth} onChange={updateField} error={errors.cardWidth} />
              <RangeField name="cardHeight" value={values.cardHeight} onChange={updateField} error={errors.cardHeight} />
              <RangeField
                name="cardBorderRadius"
                value={values.cardBorderRadius}
                onChange={updateField}
                error={errors.cardBorderRadius}
              />
            </div>
          </fieldset>

          {/* Profile photo dimensions */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// profile"}</legend>
            <div className="grid sm:grid-cols-3 gap-5">
              <RangeField
                name="profileWidth"
                value={values.profileWidth}
                onChange={updateField}
                error={errors.profileWidth}
              />
              <RangeField
                name="profileHeight"
                value={values.profileHeight}
                onChange={updateField}
                error={errors.profileHeight}
              />
              <RangeField
                name="profileBorderRadius"
                value={values.profileBorderRadius}
                onChange={updateField}
                error={errors.profileBorderRadius}
              />
            </div>
            <p className="text-[11px] text-cloud-500 leading-relaxed">
              Shape radius: 0px = square corners, a large value (e.g. half the width) = a full circle.
            </p>
          </fieldset>

          {/* Spacing */}
          <fieldset className="card-surface p-5 sm:p-6 space-y-5">
            <legend className="font-mono text-xs text-blue-400 px-1">{"// spacing"}</legend>
            <div className="grid sm:grid-cols-3 gap-5">
              <RangeField
                name="borderRadius"
                value={values.borderRadius}
                onChange={updateField}
                error={errors.borderRadius}
              />
              <RangeField name="padding" value={values.padding} onChange={updateField} error={errors.padding} />
              <RangeField name="margin" value={values.margin} onChange={updateField} error={errors.margin} />
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              disabled={saving || resetting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-cloud-300 border border-ink-600 hover:border-coral-400/60 hover:text-coral-400 disabled:opacity-60"
            >
              <LuRotateCcw className="h-4 w-4" /> Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty || saving || resetting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-cloud-300 hover:bg-ink-700 disabled:opacity-40"
            >
              <LuX className="h-4 w-4" /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving || resetting || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
            >
              <LuSave className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Live preview panel — reflects `values` (unsaved edits) immediately,
            not `savedValues`, so admins see the effect of every change as
            they make it, before ever hitting Save. */}
        <div className="lg:sticky lg:top-6">
          <div className="card-surface p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs text-blue-400">{"// live-preview"}</h3>
              <div className="flex rounded-lg border border-ink-600 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTheme("dark")}
                  className={`px-2.5 py-1 ${previewTheme === "dark" ? "bg-ink-700 text-cloud-100" : "text-cloud-500"}`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`px-2.5 py-1 ${previewTheme === "light" ? "bg-ink-700 text-cloud-100" : "text-cloud-500"}`}
                >
                  Light
                </button>
              </div>
            </div>
            <div
              className="rounded-xl overflow-hidden border border-ink-700"
              style={{
                backgroundColor: HEX_COLOR_REGEX.test(previewBgColor) ? previewBgColor : "#FFFFFF",
                padding: `${values.padding || 0}px`,
              }}
            >
              <p
                style={{
                  color: HEX_COLOR_REGEX.test(previewFontColor) ? previewFontColor : "#000000",
                  fontFamily: values.fontFamily,
                  fontSize: `${values.fontSize || 16}px`,
                  lineHeight: values.lineHeight || 1.5,
                  letterSpacing: `${values.letterSpacing || 0}px`,
                  margin: `0 0 ${values.margin || 0}px 0`,
                }}
              >
                The quick brown fox jumps over the lazy dog. This paragraph
                previews your typography and color settings exactly as
                visitors will see them.
              </p>
              <div
                className="bg-gradient-to-br from-blue-400/40 to-violet-400/40 flex items-center justify-center text-xs font-mono text-white/80"
                style={{
                  width: `${Math.min(values.imageWidth || 300, 320)}px`,
                  maxWidth: "100%",
                  height: `${Math.min(values.imageHeight || 200, 220)}px`,
                  borderRadius: `${values.borderRadius || 0}px`,
                }}
              >
                {values.imageWidth || 0} × {values.imageHeight || 0}px
              </div>
            </div>
            <p className="mt-3 text-[11px] text-cloud-500 leading-relaxed">
              Image preview is capped to fit this panel; the actual saved width/height applies on the live site.
            </p>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset appearance settings?"
        message="This restores every field below to its factory default. This can't be undone, but you can always change values again afterward."
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={handleReset}
        loading={resetting}
        confirmLabel="Reset to Defaults"
        confirmLoadingLabel="Resetting…"
        confirmClassName="bg-blue-500 hover:bg-blue-600"
      />
    </div>
  );
}
