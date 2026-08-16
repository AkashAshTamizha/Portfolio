import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { resourceApi } from "../api/client";
import DataTable from "./DataTable";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import FormField from "./FormField";
import ImageUploader from "./ImageUploader";
import MultiUploader from "./MultiUploader";

function emptyValues(fields) {
  const obj = {};
  fields.forEach((f) => {
    if (f.type === "checkbox") obj[f.name] = false;
    else if (f.type === "tags") obj[f.name] = "";
    else if (f.type === "gallery") obj[f.name] = [];
    else if (f.type === "documents") obj[f.name] = [];
    else obj[f.name] = f.type === "number" ? "" : "";
  });
  return obj;
}

function toFormValues(item, fields) {
  const obj = {};
  fields.forEach((f) => {
    const raw = item[f.name];
    if (f.type === "tags") obj[f.name] = Array.isArray(raw) ? raw.join(", ") : raw || "";
    else if (f.type === "date") obj[f.name] = raw ? String(raw).slice(0, 10) : "";
    else if (f.type === "gallery" || f.type === "documents") obj[f.name] = raw || [];
    else obj[f.name] = raw ?? (f.type === "checkbox" ? false : "");
  });
  return obj;
}

function toPayload(values, fields) {
  const payload = {};
  fields.forEach((f) => {
    const v = values[f.name];
    if (f.type === "tags") {
      payload[f.name] = String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === "number") {
      payload[f.name] = v === "" ? undefined : Number(v);
    } else {
      payload[f.name] = v;
    }
  });
  return payload;
}

/**
 * Config-driven CRUD page. One instance of this powers every list-type
 * module (Skills, Services, Experience, Education, Certifications, Projects)
 * so each module's page file is just a thin config wrapper.
 */
export default function ResourceManager({ title, description, apiPath, columns, fields, uploadType, extraActions, headerAction }) {
  const api = useMemo(() => resourceApi(apiPath), [apiPath]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => emptyValues(fields));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = search ? `search=${encodeURIComponent(search)}` : "";
      const res = await api.list(qs);
      setRows(res.data || []);
    } catch (err) {
      toast.error(err.message || `Failed to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [api, search, title]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setValues(emptyValues(fields));
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setValues(toFormValues(row, fields));
    setErrors({});
    setModalOpen(true);
  }

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name] && values[f.name] !== 0 && values[f.name] !== false) {
        nextErrors[f.name] = `${f.label} is required.`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = toPayload(values, fields);
      if (editing) {
        await api.update(editing._id, payload);
        toast.success(`${title} updated.`);
      } else {
        await api.create(payload);
        toast.success(`${title} created.`);
      }
      setModalOpen(false);
      load();
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

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.remove(deleteTarget._id);
      toast.success(`${title} deleted.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cloud-100">{title}</h1>
          {description && <p className="text-sm text-cloud-400 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {headerAction}
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow shrink-0"
          >
            <LuPlus className="h-4 w-4" />
            Add {title.replace(/s$/, "")}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        extraActions={extraActions}
      />

      <Modal open={modalOpen} title={editing ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`} onClose={() => setModalOpen(false)} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => {
            if (f.type === "image") {
              return <ImageUploader key={f.name} label={f.label} type={uploadType} value={values[f.name]} onChange={(v) => updateField(f.name, v)} />;
            }
            if (f.type === "gallery") {
              return (
                <MultiUploader
                  key={f.name}
                  mode="images"
                  label={f.label}
                  type={uploadType}
                  value={values[f.name]}
                  onChange={(v) => updateField(f.name, v)}
                />
              );
            }
            if (f.type === "documents") {
              return (
                <MultiUploader
                  key={f.name}
                  mode="documents"
                  label={f.label}
                  type="documents"
                  value={values[f.name]}
                  onChange={(v) => updateField(f.name, v)}
                />
              );
            }
            return (
              <FormField key={f.name} field={f} value={values[f.name]} onChange={updateField} error={errors[f.name]} />
            );
          })}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-cloud-300 hover:bg-ink-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`This will permanently delete this ${title.toLowerCase().replace(/s$/, "")} entry.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
