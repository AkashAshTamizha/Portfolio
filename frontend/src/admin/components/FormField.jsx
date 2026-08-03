const baseInputClasses =
  "w-full rounded-xl bg-ink-900 border px-3.5 py-2.5 text-sm text-cloud-100 placeholder:text-cloud-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors";

function fieldBorder(error) {
  return error ? "border-coral-500" : "border-ink-600";
}

export default function FormField({ field, value, onChange, error }) {
  const { name, label, type = "text", placeholder, options, helpText, required, maxLength } = field;

  function handleChange(e) {
    const raw = e.target.value;
    if (type === "number") return onChange(name, raw === "" ? "" : Number(raw));
    if (type === "checkbox") return onChange(name, e.target.checked);
    if (type === "tags") return onChange(name, raw); // raw comma-separated string, split on submit
    return onChange(name, raw);
  }

  return (
    <div className={type === "checkbox" ? "flex items-center gap-2" : ""}>
      {type !== "checkbox" && (
        <label htmlFor={name} className="block text-sm font-medium text-cloud-300 mb-1.5">
          {label} {required && <span className="text-coral-400">*</span>}
        </label>
      )}

      {type === "textarea" && (
        <textarea
          id={name}
          name={name}
          rows={field.rows || 4}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={handleChange}
          maxLength={maxLength}
          className={`${baseInputClasses} ${fieldBorder(error)} resize-y`}
        />
      )}

      {type === "select" && (
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          className={`${baseInputClasses} ${fieldBorder(error)}`}
        >
          <option value="" disabled>
            Select…
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === "checkbox" && (
        <>
          <input
            id={name}
            type="checkbox"
            checked={!!value}
            onChange={handleChange}
            className="h-4 w-4 rounded border-ink-600 bg-ink-900 text-blue-500 focus:ring-blue-400"
          />
          <label htmlFor={name} className="text-sm font-medium text-cloud-300">
            {label}
          </label>
        </>
      )}

      {(type === "text" || type === "number" || type === "date" || type === "email" || type === "url" || type === "tags") && (
        <input
          id={name}
          type={type === "tags" ? "text" : type}
          name={name}
          value={value ?? ""}
          placeholder={type === "tags" ? `${placeholder || ""} (comma-separated)` : placeholder}
          onChange={handleChange}
          maxLength={type === "tags" ? undefined : maxLength}
          className={`${baseInputClasses} ${fieldBorder(error)}`}
        />
      )}

      {helpText && !error && <p className="mt-1 text-xs text-cloud-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-coral-400">{error}</p>}
    </div>
  );
}
