import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuUpload } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api, API_BASE_URL } from "../api/client";
import ResumeDownloadButton from "../../components/ui/ResumeDownloadButton";

function assetUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
}

export default function ProfilePage() {
  const { employee, setEmployee } = useAuth();
  const [form, setForm] = useState({ about: "", designation: "", experience: 0 });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        about: employee.about || "",
        designation: employee.designation || "",
        experience: employee.experience || 0,
      });
    }
  }, [employee]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee._id}`, form);
      setEmployee(res.data);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await api.upload(`/employees/${employee._id}/photo?type=employees`, file);
      setEmployee(res.data.employee);
      toast.success("Photo updated.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const res = await api.upload(`/employees/${employee._id}/resume?type=resumes`, file);
      setEmployee(res.data);
      toast.success("Resume uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploadingResume(false);
    }
  }

  if (!employee) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">Profile</h1>
        <p className="text-sm text-cloud-500 mt-1">This is what shows on your public team profile.</p>
      </div>

      <div className="card-surface p-6 flex items-center gap-5">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-ink-800 border border-ink-700 shrink-0">
          {employee.photo ? (
            <img src={assetUrl(employee.photo)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl text-cloud-500">
              {employee.user?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <label className="btn-secondary cursor-pointer text-sm">
            <LuUpload className="h-4 w-4" />
            {uploadingPhoto ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSave} className="card-surface p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Designation / Job Role</label>
          <input
            value={form.designation}
            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Senior Developer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Years of Experience</label>
          <input
            type="number"
            min="0"
            value={form.experience}
            onChange={(e) => setForm((f) => ({ ...f, experience: Number(e.target.value) }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">About / Bio</label>
          <textarea
            rows={5}
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="A short bio about your work and interests…"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="card-surface p-6">
        <h2 className="font-semibold text-cloud-100 mb-3">Resume</h2>
        <div className="flex flex-wrap items-center gap-3">
          <ResumeDownloadButton resume={employee.resume} />
          <label className="btn-secondary cursor-pointer text-sm">
            <LuUpload className="h-4 w-4" />
            {uploadingResume ? "Uploading…" : "Upload new resume"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
