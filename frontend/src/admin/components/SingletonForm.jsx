import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import FormField from "./FormField";
import ImageUploader from "./ImageUploader";

function flatten(obj, fields) {
  const out = {};
  fields.forEach((f) => {
    if (f.group) {
      out[f.name] = obj?.[f.group]?.[f.name] ?? "";
    } else if (f.type === "tags") {
      out[f.name] = Array.isArray(obj?.[f.name]) ? obj[f.name].join(", ") : "";
    } else {
      out[f.name] = obj?.[f.name] ?? (f.type === "number" ? "" : "");
    }
  });
  return out;
}

function unflatten(values, fields) {
  const payload = {};
  fields.forEach((f) => {
    let v = values[f.name];
    if (f.type === "tags") {
      v = String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (f.type === "number") v = v === "" ? undefined : Number(v);
    if (f.group) {
      payload[f.group] = payload[f.group] || {};
      payload[f.group][f.name] = v;
    } else {
      payload[f.name] = v;
    }
  });
  return payload;
}

/**
 * Form for singleton resources: Profile and Contact Info. Both are a single
 * document (created lazily by the backend), fetched on mount and updated
 * via PUT with upsert semantics.
 */
export default function SingletonForm({ title, description, apiPath, fields, imageField, uploadType }) {
  const [values, setValues] = useState({});
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    api
      .get(apiPath)
      .then((res) => {
        if (!mounted) return;
        setValues(flatten(res.data, fields));
        if (imageField) setAvatar(res.data?.[imageField] || "");
      })
      .catch((err) => toast.error(err.message || "Failed to load."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [apiPath, fields, imageField]);

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]) nextErrors[f.name] = `${f.label} is required.`;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = unflatten(values, fields);
      if (imageField) payload[imageField] = avatar;
      const res = await api.put(apiPath, payload);
      setValues(flatten(res.data, fields));
      toast.success(`${title} updated successfully.`);
    } catch (err) {
      if (err.errors?.length) {
        const fieldErrors = {};
        err.errors.forEach((e2) => {
          if (e2.path) fieldErrors[e2.path] = e2.msg;
        });
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-cloud-500 text-sm">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-cloud-100">{title}</h1>
        {description && <p className="text-sm text-cloud-400 mt-1">{description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 space-y-5 max-w-2xl">
        {imageField && <ImageUploader label="Photo" type={uploadType} value={avatar} onChange={setAvatar} />}
        {fields.map((f) => (
          <FormField key={f.name} field={f} value={values[f.name]} onChange={updateField} error={errors[f.name]} />
        ))}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
