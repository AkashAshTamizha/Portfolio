import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";

const STATUS_STYLES = {
  todo: "bg-cloud-500/10 text-cloud-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  blocked: "bg-coral-500/10 text-coral-400",
};

function TaskRow({ task, onUpdated }) {
  const [progress, setProgress] = useState(task.progress);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch(`/tasks/${task._id}/progress`, { progress: Number(progress) });
      onUpdated(res.data);
      toast.success("Progress updated.");
    } catch (err) {
      toast.error(err.message || "Could not update progress.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-surface p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-cloud-100">{task.title}</p>
          {task.project?.name && <p className="text-xs text-cloud-500 mt-0.5">Project: {task.project.name}</p>}
          {task.description && <p className="text-sm text-cloud-500 mt-1.5">{task.description}</p>}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[task.status] || ""}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          className="flex-1 accent-blue-400"
        />
        <span className="text-sm text-cloud-400 w-12 text-right">{progress}%</span>
        <button onClick={handleSave} disabled={saving || Number(progress) === task.progress} className="btn-secondary text-sm disabled:opacity-50">
          {saving ? "Saving…" : "Update"}
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/tasks")
      .then((res) => setTasks(res.data || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleUpdated(updated) {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">My Tasks</h1>
        <p className="text-sm text-cloud-500 mt-1">Update your progress as you go.</p>
      </div>

      {loading ? (
        <p className="text-sm text-cloud-500">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-cloud-500">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskRow key={task._id} task={task} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
