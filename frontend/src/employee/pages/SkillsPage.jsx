import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"];

export default function SkillsPage() {
  const { employee, setEmployee } = useAuth();
  const [masterSkills, setMasterSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/skills?limit=200")
      .then((res) => setMasterSkills(res.data || []))
      .catch(() => setMasterSkills([]));
  }, []);

  const mySkills = employee?.skills || [];
  const availableSkills = masterSkills.filter((s) => !mySkills.some((m) => (m.skill?._id || m.skill) === s._id));

  async function persist(nextSkills) {
    setSaving(true);
    try {
      const payload = nextSkills.map((s) => ({ skill: s.skill?._id || s.skill, level: s.level }));
      const res = await api.put(`/employees/${employee._id}`, { skills: payload });
      setEmployee(res.data);
    } catch (err) {
      toast.error(err.message || "Could not update skills.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!skillId) return toast.error("Choose a skill first.");
    await persist([...mySkills, { skill: skillId, level }]);
    setSkillId("");
    setLevel("intermediate");
  }

  async function handleRemove(id) {
    await persist(mySkills.filter((s) => (s.skill?._id || s.skill) !== id));
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">Skills</h1>
        <p className="text-sm text-cloud-500 mt-1">Shown on your public team profile.</p>
      </div>

      <form onSubmit={handleAdd} className="card-surface p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Skill</label>
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a skill…</option>
            {availableSkills.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-sm font-medium text-cloud-300 mb-1.5">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          <LuPlus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {mySkills.length === 0 ? (
          <p className="text-sm text-cloud-500">No skills added yet.</p>
        ) : (
          mySkills.map((s) => {
            const id = s.skill?._id || s.skill;
            return (
              <span key={id} className="tag-chip flex items-center gap-2">
                {s.skill?.name || masterSkills.find((m) => m._id === id)?.name || "Skill"} · {s.level}
                <button onClick={() => handleRemove(id)} aria-label="Remove skill">
                  <LuTrash2 className="h-3 w-3" />
                </button>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
