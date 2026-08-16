import { useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2, LuPencil } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { formatPeriod } from "../../utils/date";

const EMPTY = { institution: "", degree: "", field: "", startDate: "", endDate: "", grade: "", description: "" };

export default function EducationPage() {
  const { employee, setEmployee } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const list = employee?.education || [];

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry._id);
    setForm({
      institution: entry.institution || "",
      degree: entry.degree || "",
      field: entry.field || "",
      startDate: entry.startDate ? entry.startDate.slice(0, 10) : "",
      endDate: entry.endDate ? entry.endDate.slice(0, 10) : "",
      grade: entry.grade || "",
      description: entry.description || "",
    });
    setOpen(true);
  }

  async function persist(nextList) {
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee._id}`, { education: nextList });
      setEmployee(res.data);
      setOpen(false);
    } catch (err) {
      toast.error(err.message || "Could not save education.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.institution.trim() || !form.degree.trim()) {
      return toast.error("Institution and degree are required.");
    }
    const entry = { ...form };
    if (editingId) {
      await persist(list.map((item) => (item._id === editingId ? { ...entry, _id: editingId } : item)));
    } else {
      await persist([...list, entry]);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this education entry?")) return;
    await persist(list.filter((item) => item._id !== id));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Education</h1>
          <p className="text-sm text-cloud-500 mt-1">Shown on your public team profile.</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <LuPlus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-cloud-500">No education added yet.</p>
        ) : (
          list.map((entry) => (
            <div key={entry._id} className="card-surface p-5 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-cloud-100">
                  {entry.degree}
                  {entry.field ? ` · ${entry.field}` : ""}
                </p>
                <p className="text-sm text-cloud-400">{entry.institution}</p>
                <p className="text-xs text-cloud-600 mt-1">{formatPeriod(entry.startDate, entry.endDate)}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-blue-400">
                  <LuPencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(entry._id)} className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400">
                  <LuTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={open} title={editingId ? "Edit Education" : "Add Education"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ["institution", "Institution", "text"],
            ["degree", "Degree", "text"],
            ["field", "Field of Study", "text"],
            ["startDate", "Start Date", "date"],
            ["endDate", "End Date", "date"],
            ["grade", "Grade / GPA", "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
