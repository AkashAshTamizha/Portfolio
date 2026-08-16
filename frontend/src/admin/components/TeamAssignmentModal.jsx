import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuTrash2, LuUserPlus } from "react-icons/lu";
import Modal from "./Modal";
import { api } from "../api/client";

const emptyDraft = { employee: "", role: "", contribution: "" };

export default function TeamAssignmentModal({ open, project, onClose, onChanged }) {
  const [employees, setEmployees] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(() => {
    if (!project) return;
    setLoading(true);
    Promise.all([api.get("/employees?limit=200"), api.get(`/projects/${project._id}`)])
      .then(([empRes, projRes]) => {
        setEmployees(empRes.data || []);
        setTeam(projRes.data?.team || []);
      })
      .catch((err) => toast.error(err.message || "Could not load team data."))
      .finally(() => setLoading(false));
  }, [project]);

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft);
      load();
    }
  }, [open, load]);

  const employeeName = useMemo(() => {
    const map = new Map(employees.map((e) => [e._id, e.user?.name || e.employeeCode]));
    return (id) => map.get(id) || map.get(String(id)) || "Unknown employee";
  }, [employees]);

  const availableEmployees = useMemo(
    () => employees.filter((e) => !team.some((t) => String(t.employee) === String(e._id))),
    [employees, team]
  );

  async function handleAssign(e) {
    e.preventDefault();
    if (!draft.employee) {
      toast.error("Choose an employee first.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/projects/${project._id}/team`, draft);
      toast.success("Team member assigned.");
      setDraft(emptyDraft);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || "Could not assign team member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(employeeId) {
    setRemovingId(employeeId);
    try {
      await api.delete(`/projects/${project._id}/team/${employeeId}`);
      toast.success("Team member removed.");
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message || "Could not remove team member.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Modal open={open} title={`Team — ${project?.name || ""}`} onClose={onClose} wide>
      {loading ? (
        <p className="text-sm text-cloud-500 py-6 text-center">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-cloud-300 mb-3">Current team</h3>
            {team.length === 0 ? (
              <p className="text-sm text-cloud-500">No employees assigned to this project yet.</p>
            ) : (
              <div className="space-y-2">
                {team.map((t) => (
                  <div
                    key={String(t.employee)}
                    className="flex items-start justify-between gap-3 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cloud-100">{employeeName(t.employee)}</p>
                      {t.role && <p className="text-xs text-blue-400 mt-0.5">{t.role}</p>}
                      {t.contribution && <p className="text-xs text-cloud-500 mt-1 leading-relaxed">{t.contribution}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(t.employee)}
                      disabled={removingId === t.employee}
                      className="p-2 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400 disabled:opacity-50 shrink-0"
                      aria-label="Remove from project"
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-ink-700">
            <h3 className="text-sm font-semibold text-cloud-300 mb-3">Assign an employee</h3>
            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-cloud-300 mb-1.5">Employee</label>
                <select
                  value={draft.employee}
                  onChange={(e) => setDraft((d) => ({ ...d, employee: e.target.value }))}
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select an employee…</option>
                  {availableEmployees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.user?.name || e.employeeCode}
                      {e.designation ? ` — ${e.designation}` : ""}
                    </option>
                  ))}
                </select>
                {availableEmployees.length === 0 && employees.length > 0 && (
                  <p className="mt-1 text-xs text-cloud-500">All employees are already assigned to this project.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cloud-300 mb-1.5">Role on this project</label>
                <input
                  type="text"
                  value={draft.role}
                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                  placeholder="e.g. Lead Developer"
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 placeholder:text-cloud-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cloud-300 mb-1.5">Contribution</label>
                <textarea
                  rows={3}
                  value={draft.contribution}
                  onChange={(e) => setDraft((d) => ({ ...d, contribution: e.target.value }))}
                  placeholder="What did they build or own on this project?"
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 placeholder:text-cloud-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
              >
                <LuUserPlus className="h-4 w-4" />
                {saving ? "Saving…" : "Assign to project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
