import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { api } from "../api/client";

const LEAVE_TYPES = [
  { value: "casual", label: "Casual" },
  { value: "sick", label: "Sick" },
  { value: "earned", label: "Earned" },
  { value: "unpaid", label: "Unpaid" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-coral-500/10 text-coral-400",
  cancelled: "bg-cloud-500/10 text-cloud-400",
};

const EMPTY = { leaveType: "casual", startDate: "", endDate: "", reason: "" };

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    setLoading(true);
    api
      .get("/leaves")
      .then((res) => setLeaves(res.data || []))
      .catch((err) => toast.error(err.message || "Could not load leave history."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const pendingCount = useMemo(() => leaves.filter((l) => l.status === "pending").length, [leaves]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.post("/leaves", form);
      toast.success("Leave request submitted.");
      setForm(EMPTY);
      load();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e2) => (fieldErrors[e2.path] = e2.msg));
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Could not submit leave request.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await api.patch(`/leaves/${id}/cancel`);
      toast.success("Leave request cancelled.");
      load();
    } catch (err) {
      toast.error(err.message || "Could not cancel leave request.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">Leave</h1>
        <p className="text-sm text-cloud-500 mt-1">
          Apply for leave and track your requests. {pendingCount > 0 && `${pendingCount} awaiting approval.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 space-y-4">
        <h2 className="font-semibold text-cloud-100 flex items-center gap-2">
          <LuPlus className="h-4 w-4" /> Apply for Leave
        </h2>

        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Leave Type</label>
          <select
            value={form.leaveType}
            onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Start Date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className={`w-full rounded-xl bg-ink-900 border px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.startDate ? "border-coral-500" : "border-ink-600"
              }`}
            />
            {errors.startDate && <p className="mt-1 text-xs text-coral-400">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">End Date *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className={`w-full rounded-xl bg-ink-900 border px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.endDate ? "border-coral-500" : "border-ink-600"
              }`}
            />
            {errors.endDate && <p className="mt-1 text-xs text-coral-400">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Reason *</label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="Briefly describe why you're requesting leave…"
            className={`w-full rounded-xl bg-ink-900 border px-3.5 py-2.5 text-sm text-cloud-100 placeholder:text-cloud-500 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.reason ? "border-coral-500" : "border-ink-600"
            }`}
          />
          {errors.reason && <p className="mt-1 text-xs text-coral-400">{errors.reason}</p>}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit Request"}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold text-cloud-300 mb-3">Leave History</h2>
        {loading ? (
          <p className="text-sm text-cloud-500">Loading…</p>
        ) : leaves.length === 0 ? (
          <p className="text-sm text-cloud-500">No leave requests yet.</p>
        ) : (
          <div className="space-y-3">
            {leaves.map((leave) => (
              <div key={leave._id} className="card-surface p-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-cloud-100 capitalize">{leave.leaveType} Leave · {leave.days} day(s)</p>
                  <p className="text-xs text-cloud-500 mt-0.5">
                    {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-cloud-400 mt-1.5">{leave.reason}</p>
                  {leave.reviewNote && (
                    <p className="text-xs text-cloud-500 mt-1.5">Reviewer note: {leave.reviewNote}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[leave.status] || ""}`}>
                    {leave.status}
                  </span>
                  {leave.status === "pending" && (
                    <button
                      onClick={() => handleCancel(leave._id)}
                      disabled={cancellingId === leave._id}
                      className="text-xs text-coral-400 hover:underline disabled:opacity-50"
                    >
                      {cancellingId === leave._id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
