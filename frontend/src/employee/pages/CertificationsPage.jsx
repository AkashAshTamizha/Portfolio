import { useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2, LuPencil } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { formatMonthYear } from "../../utils/date";

const EMPTY = { name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" };

export default function CertificationsPage() {
  const { employee, setEmployee } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const list = employee?.certifications || [];

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry._id);
    setForm({
      name: entry.name || "",
      issuer: entry.issuer || "",
      issueDate: entry.issueDate ? entry.issueDate.slice(0, 10) : "",
      expiryDate: entry.expiryDate ? entry.expiryDate.slice(0, 10) : "",
      credentialId: entry.credentialId || "",
      credentialUrl: entry.credentialUrl || "",
    });
    setOpen(true);
  }

  async function persist(nextList) {
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee._id}`, { certifications: nextList });
      setEmployee(res.data);
      setOpen(false);
    } catch (err) {
      toast.error(err.message || "Could not save certification.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.issuer.trim()) {
      return toast.error("Certification name and issuer are required.");
    }
    if (editingId) {
      await persist(list.map((item) => (item._id === editingId ? { ...form, _id: editingId } : item)));
    } else {
      await persist([...list, form]);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this certification?")) return;
    await persist(list.filter((item) => item._id !== id));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Certifications</h1>
          <p className="text-sm text-cloud-500 mt-1">Shown on your public team profile.</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <LuPlus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-cloud-500">No certifications added yet.</p>
        ) : (
          list.map((entry) => (
            <div key={entry._id} className="card-surface p-5 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-cloud-100">{entry.name}</p>
                <p className="text-sm text-cloud-400">{entry.issuer}</p>
                <p className="text-xs text-cloud-600 mt-1">
                  {formatMonthYear(entry.issueDate)}
                  {entry.expiryDate ? ` — expires ${formatMonthYear(entry.expiryDate)}` : ""}
                </p>
                {entry.credentialUrl && (
                  <a href={entry.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                    View credential
                  </a>
                )}
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

      <Modal open={open} title={editingId ? "Edit Certification" : "Add Certification"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ["name", "Certification Name", "text"],
            ["issuer", "Issuer", "text"],
            ["issueDate", "Issue Date", "date"],
            ["expiryDate", "Expiry Date", "date"],
            ["credentialId", "Credential ID", "text"],
            ["credentialUrl", "Credential URL", "text"],
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
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
