import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuCheck, LuX, LuInbox } from "react-icons/lu";
import Modal from "../components/Modal";
import { api } from "../api/client";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-coral-500/10 text-coral-400",
  cancelled: "bg-cloud-500/10 text-cloud-400",
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ employee: "", status: "" });

  const [reviewTarget, setReviewTarget] = useState(null); // { leave, action: "approve" | "reject" }
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.employee) params.set("employee", filters.employee);
    if (filters.status) params.set("status", filters.status);
    api
      .get(`/leaves?${params.toString()}`)
      .then((res) => setLeaves(res.data || []))
      .catch((err) => toast.error(err.message || "Could not load leave requests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get("/employees?limit=200").then((res) => setEmployees(res.data || []));
  }, []);

  useEffect(load, [filters]);

  const pendingCount = useMemo(() => leaves.filter((l) => l.status === "pending").length, [leaves]);

  function openReview(leave, action) {
    setReviewTarget({ leave, action });
    setReviewNote("");
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { leave, action } = reviewTarget;
      await api.patch(`/leaves/${leave._id}/${action}`, { reviewNote });
      toast.success(action === "approve" ? "Leave approved." : "Leave rejected.");
      setReviewTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update leave request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display">Leave Requests</h1>
        <p className="text-sm text-cloud-500 mt-1">
          {pendingCount > 0 ? `${pendingCount} request(s) awaiting your review.` : "Review and manage employee leave requests."}
        </p>
      </div>

      <div className="card-surface p-4 flex flex-wrap gap-3">
        <select
          value={filters.employee}
          onChange={(e) => setFilters((f) => ({ ...f, employee: e.target.value }))}
          className="rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.user?.name || e.employeeCode} ({e.employeeCode})
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-cloud-500">Loading…</p>}
        {!loading && leaves.length === 0 && (
          <div className="card-surface p-14 flex flex-col items-center gap-2 text-cloud-500">
            <LuInbox className="h-8 w-8" />
            <span>No leave requests found.</span>
          </div>
        )}
        {!loading &&
          leaves.map((leave) => (
            <div key={leave._id} className="card-surface p-4 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-cloud-100">
                  {leave.employee?.user?.name || leave.employee?.employeeCode}{" "}
                  <span className="text-cloud-500 font-normal capitalize">· {leave.leaveType} · {leave.days} day(s)</span>
                </p>
                <p className="text-xs text-cloud-500 mt-0.5">
                  {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-cloud-400 mt-1.5">{leave.reason}</p>
                {leave.reviewNote && <p className="text-xs text-cloud-500 mt-1.5">Note: {leave.reviewNote}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[leave.status] || ""}`}>{leave.status}</span>
                {leave.status === "pending" && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openReview(leave, "approve")}
                      className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-emerald-400"
                      aria-label="Approve"
                    >
                      <LuCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openReview(leave, "reject")}
                      className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-coral-400"
                      aria-label="Reject"
                    >
                      <LuX className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <Modal
        open={!!reviewTarget}
        title={reviewTarget?.action === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
        onClose={() => setReviewTarget(null)}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <p className="text-sm text-cloud-400">
            {reviewTarget?.action === "approve"
              ? "This will mark the requested days as on-leave in attendance."
              : "The employee will be notified that this request was rejected."}
          </p>
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Note (optional)</label>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${
              reviewTarget?.action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-coral-500 hover:bg-coral-600"
            }`}
          >
            {saving ? "Saving…" : reviewTarget?.action === "approve" ? "Approve" : "Reject"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
