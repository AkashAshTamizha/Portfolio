import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuPencil, LuTrash2, LuInbox } from "react-icons/lu";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { api } from "../api/client";

const STATUS_OPTIONS = ["present", "absent", "half_day", "on_leave"];

const STATUS_STYLES = {
  present: "bg-emerald-500/10 text-emerald-400",
  half_day: "bg-amber-500/10 text-amber-400",
  on_leave: "bg-blue-500/10 text-blue-400",
  absent: "bg-coral-500/10 text-coral-400",
};

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
function toTimeInput(value) {
  return value ? new Date(value).toTimeString().slice(0, 5) : "";
}
function combine(date, time) {
  if (!date || !time) return null;
  return new Date(`${date}T${time}:00`).toISOString();
}

const EMPTY = { employee: "", date: "", punchIn: "", punchOut: "", status: "present", notes: "" };

export default function AttendancePage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({ employee: "", status: "", from: "", to: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [report, setReport] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const now = new Date();
  const [reportMonth, setReportMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });

  const buildQuery = useCallback(
    (pageNum) => {
      const params = new URLSearchParams({ page: pageNum, limit: "15" });
      if (filters.employee) params.set("employee", filters.employee);
      if (filters.status) params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      return params.toString();
    },
    [filters]
  );

  const load = useCallback(
    (pageNum = 1) => {
      setLoading(true);
      api
        .get(`/attendance?${buildQuery(pageNum)}`)
        .then((res) => {
          setRows(res.data || []);
          setPage(res.page || 1);
          setPages(res.pages || 1);
        })
        .catch((err) => toast.error(err.message || "Could not load attendance."))
        .finally(() => setLoading(false));
    },
    [buildQuery]
  );

  useEffect(() => {
    api.get("/employees?limit=200").then((res) => setEmployees(res.data || []));
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  function employeeLabel(e) {
    return `${e.user?.name || e.employeeCode} (${e.employeeCode})`;
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      employee: row.employee?._id || row.employee,
      date: toDateInput(row.date),
      punchIn: toTimeInput(row.punchIn),
      punchOut: toTimeInput(row.punchOut),
      status: row.status,
      notes: row.notes || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      employee: form.employee,
      date: form.date,
      status: form.status,
      notes: form.notes,
      punchIn: combine(form.date, form.punchIn),
      punchOut: combine(form.date, form.punchOut),
    };
    try {
      if (editing) {
        await api.put(`/attendance/${editing._id}`, payload);
        toast.success("Attendance record updated.");
      } else {
        await api.post("/attendance", payload);
        toast.success("Attendance record created.");
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || "Could not save attendance record.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/attendance/${confirmTarget._id}`);
      toast.success("Attendance record deleted.");
      setConfirmTarget(null);
      load(page);
    } catch (err) {
      toast.error(err.message || "Could not delete record.");
    } finally {
      setDeleting(false);
    }
  }

  function loadReport() {
    setReportOpen(true);
    api
      .get(`/attendance/report/monthly?year=${reportMonth.year}&month=${reportMonth.month}`)
      .then((res) => setReport(res.data || []))
      .catch((err) => toast.error(err.message || "Could not load report."));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold font-display">Attendance</h1>
          <p className="text-sm text-cloud-500 mt-1">Punch-in history across your team, with daily/monthly filters.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadReport} className="btn-secondary text-sm">
            Monthly Report
          </button>
          <button onClick={openCreate} className="btn-primary text-sm">
            <LuPlus className="h-4 w-4" /> Add Record
          </button>
        </div>
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
              {employeeLabel(e)}
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
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
          aria-label="To date"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-cloud-400">
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">In</th>
                <th className="px-4 py-3 font-medium">Out</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-cloud-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-cloud-500">
                    <div className="flex flex-col items-center gap-2">
                      <LuInbox className="h-8 w-8" />
                      <span>No records found.</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className="border-b border-ink-700/60 hover:bg-ink-700/30">
                    <td className="px-4 py-3 text-cloud-200">{r.employee?.user?.name || r.employee?.employeeCode || "—"}</td>
                    <td className="px-4 py-3 text-cloud-300">{toDateInput(r.date)}</td>
                    <td className="px-4 py-3 text-cloud-300">{toTimeInput(r.punchIn) || "—"}</td>
                    <td className="px-4 py-3 text-cloud-300">{toTimeInput(r.punchOut) || "—"}</td>
                    <td className="px-4 py-3 text-cloud-300">{r.workedHours || 0}h</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] || ""}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(r)} className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-blue-400" aria-label="Edit">
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmTarget(r)} className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-coral-400" aria-label="Delete">
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-700 text-sm text-cloud-400">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="btn-secondary text-xs disabled:opacity-40">
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button disabled={page >= pages} onClick={() => load(page + 1)} className="btn-secondary text-xs disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Attendance Record" : "Add Attendance Record"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Employee *</label>
            <select
              required
              value={form.employee}
              onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select…
              </option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {employeeLabel(e)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Date *</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">Punch In</label>
              <input
                type="time"
                value={form.punchIn}
                onChange={(e) => setForm((f) => ({ ...f, punchIn: e.target.value }))}
                className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">Punch Out</label>
              <input
                type="time"
                value={form.punchOut}
                onChange={(e) => setForm((f) => ({ ...f, punchOut: e.target.value }))}
                className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cloud-300 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>

      <Modal open={reportOpen} title="Monthly Attendance Report" onClose={() => setReportOpen(false)} wide>
        <div className="flex gap-3 mb-4">
          <select
            value={reportMonth.month}
            onChange={(e) => setReportMonth((m) => ({ ...m, month: Number(e.target.value) }))}
            className="rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={reportMonth.year}
            onChange={(e) => setReportMonth((m) => ({ ...m, year: Number(e.target.value) }))}
            className="w-24 rounded-xl bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cloud-100"
          />
          <button onClick={loadReport} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-cloud-400">
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="px-3 py-2 font-medium">Present</th>
                <th className="px-3 py-2 font-medium">Half Day</th>
                <th className="px-3 py-2 font-medium">On Leave</th>
                <th className="px-3 py-2 font-medium">Absent</th>
                <th className="px-3 py-2 font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {(report || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-cloud-500">
                    No data for this month.
                  </td>
                </tr>
              )}
              {(report || []).map((r) => (
                <tr key={r.employeeId} className="border-b border-ink-700/60">
                  <td className="px-3 py-2 text-cloud-200">{r.name}</td>
                  <td className="px-3 py-2 text-cloud-300">{r.present}</td>
                  <td className="px-3 py-2 text-cloud-300">{r.halfDay}</td>
                  <td className="px-3 py-2 text-cloud-300">{r.onLeave}</td>
                  <td className="px-3 py-2 text-cloud-300">{r.absent}</td>
                  <td className="px-3 py-2 text-cloud-300">{r.totalHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete attendance record?"
        message="This will permanently delete this attendance record."
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
