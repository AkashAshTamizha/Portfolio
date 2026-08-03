import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuLogIn, LuLogOut, LuClock } from "react-icons/lu";
import { api } from "../api/client";

const STATUS_STYLES = {
  present: "bg-emerald-500/10 text-emerald-400",
  half_day: "bg-amber-500/10 text-amber-400",
  on_leave: "bg-blue-500/10 text-blue-400",
  absent: "bg-coral-500/10 text-coral-400",
};

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

export default function AttendancePage() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  function load(pageNum = 1) {
    setLoading(true);
    Promise.all([api.get("/attendance/today"), api.get(`/attendance?page=${pageNum}&limit=10`)])
      .then(([todayRes, historyRes]) => {
        setToday(todayRes.data);
        setHistory(historyRes.data || []);
        setPage(historyRes.page || 1);
        setPages(historyRes.pages || 1);
      })
      .catch((err) => toast.error(err.message || "Could not load attendance."))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(1), []);

  async function handlePunchIn() {
    setBusy(true);
    try {
      const res = await api.post("/attendance/punch-in");
      setToday(res.data);
      toast.success("Punched in.");
      load(1);
    } catch (err) {
      toast.error(err.message || "Could not punch in.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePunchOut() {
    setBusy(true);
    try {
      const res = await api.post("/attendance/punch-out");
      setToday(res.data);
      toast.success("Punched out.");
      load(page);
    } catch (err) {
      toast.error(err.message || "Could not punch out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">Attendance</h1>
        <p className="text-sm text-cloud-500 mt-1">Punch in and out, and review your history.</p>
      </div>

      <div className="card-surface p-5">
        <p className="text-xs text-cloud-500 mb-3">Today, {new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "long" })}</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-cloud-500">Punch In</p>
              <p className="text-lg font-semibold text-cloud-100">{loading ? "…" : formatTime(today?.punchIn)}</p>
            </div>
            <div>
              <p className="text-xs text-cloud-500">Punch Out</p>
              <p className="text-lg font-semibold text-cloud-100">{loading ? "…" : formatTime(today?.punchOut)}</p>
            </div>
            <div>
              <p className="text-xs text-cloud-500">Worked Hours</p>
              <p className="text-lg font-semibold text-cloud-100">{loading ? "…" : today?.workedHours || 0}h</p>
            </div>
          </div>

          {!today?.punchIn ? (
            <button onClick={handlePunchIn} disabled={busy || loading} className="btn-primary text-sm disabled:opacity-60">
              <LuLogIn className="h-4 w-4" /> Punch In
            </button>
          ) : !today?.punchOut ? (
            <button onClick={handlePunchOut} disabled={busy || loading} className="btn-primary text-sm disabled:opacity-60">
              <LuLogOut className="h-4 w-4" /> Punch Out
            </button>
          ) : (
            <span className="text-sm text-emerald-400 flex items-center gap-1.5">
              <LuClock className="h-4 w-4" /> Done for today
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-cloud-300 mb-3">History</h2>
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-cloud-400">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Punch In</th>
                  <th className="px-4 py-3 font-medium">Punch Out</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-cloud-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-cloud-500">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  history.map((rec) => (
                    <tr key={rec._id} className="border-b border-ink-700/60">
                      <td className="px-4 py-3 text-cloud-200">{formatDate(rec.date)}</td>
                      <td className="px-4 py-3 text-cloud-300">{formatTime(rec.punchIn)}</td>
                      <td className="px-4 py-3 text-cloud-300">{formatTime(rec.punchOut)}</td>
                      <td className="px-4 py-3 text-cloud-300">{rec.workedHours || 0}h</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[rec.status] || ""}`}>
                          {rec.status.replace("_", " ")}
                        </span>
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
      </div>
    </div>
  );
}
