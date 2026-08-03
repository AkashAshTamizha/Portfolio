import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

const PLATFORMS = ["linkedin", "github", "twitter", "website", "dribbble", "behance", "instagram", "other"];

export default function ContactInfoPage() {
  const { employee, setEmployee } = useAuth();
  const [contact, setContact] = useState({ phone: "", location: "", availability: "" });
  const [socials, setSocials] = useState([]);
  const [newPlatform, setNewPlatform] = useState("linkedin");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setContact({
        phone: employee.contact?.phone || "",
        location: employee.contact?.location || "",
        availability: employee.contact?.availability || "",
      });
      setSocials(employee.socialLinks || []);
    }
  }, [employee]);

  async function saveContact(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee._id}`, { contact });
      setEmployee(res.data);
      toast.success("Contact info updated.");
    } catch (err) {
      toast.error(err.message || "Could not save contact info.");
    } finally {
      setSaving(false);
    }
  }

  async function persistSocials(next) {
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee._id}`, { socialLinks: next });
      setEmployee(res.data);
      setSocials(next);
    } catch (err) {
      toast.error(err.message || "Could not update social links.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSocial(e) {
    e.preventDefault();
    if (!newUrl.trim()) return toast.error("Enter a URL first.");
    await persistSocials([...socials, { platform: newPlatform, url: newUrl.trim() }]);
    setNewUrl("");
  }

  async function handleRemoveSocial(index) {
    await persistSocials(socials.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">Contact Information</h1>
        <p className="text-sm text-cloud-500 mt-1">Shown on your public team profile.</p>
      </div>

      <form onSubmit={saveContact} className="card-surface p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Phone</label>
          <input
            value={contact.phone}
            onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Location</label>
          <input
            value={contact.location}
            onChange={(e) => setContact((c) => ({ ...c, location: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="City, Country"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Availability</label>
          <input
            value={contact.availability}
            onChange={(e) => setContact((c) => ({ ...c, availability: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Open to new projects"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-cloud-100">Social Links</h2>

        <div className="space-y-2">
          {socials.length === 0 ? (
            <p className="text-sm text-cloud-500">No social links added yet.</p>
          ) : (
            socials.map((s, i) => (
              <div key={`${s.platform}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-ink-800 px-3.5 py-2.5">
                <div className="text-sm">
                  <span className="text-cloud-300 capitalize">{s.platform}</span>{" "}
                  <span className="text-cloud-500">{s.url}</span>
                </div>
                <button onClick={() => handleRemoveSocial(i)} className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400">
                  <LuTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddSocial} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Platform</label>
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">URL</label>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-secondary text-sm">
            <LuPlus className="h-4 w-4" /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
