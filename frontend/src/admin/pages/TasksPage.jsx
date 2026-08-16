import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import ConfirmDialog from "../components/ConfirmDialog";
import { api } from "../api/client";

const EMPTY = { title: "", description: "", employee: "", project: "", dueDate: "" };

export default function TasksPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([api.get("/tasks"), api.get("/employees?limit=200"), api.get("/projects?limit=200")])
      .then(([t, e, p]) => {
        setRows(t.data || []);
        setEmployees(e.data || []);
        setProjects(p.data || []);
      })
      .catch((err) => toast.error(err.message || "Could not load tasks."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const re = new RegExp(search, "i");
    return rows.filter((r) => re.test(r.title) || re.test(r.employee?.employeeCode || ""));
  }, [rows, search]);

  const fields = useMemo(
    () => [
      { name: "title", label: "Task Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "employee",
        label: "Assign To",
        type: "select",
        required: true,
        options: employees.map((e) => ({ value: e._id, label: `${e.user?.name || e.employeeCode} (${e.employeeCode})` })),
      },
      {
        name: "project",
        label: "Related Project (optional)",
        type: "select",
        options: projects.map((p) => ({ value: p._id, label: p.name })),
      },
      { name: "dueDate", label: "Due Date", type: "date" },
    ],
    [employees, projects]
  );

  const columns = [
    { key: "title", label: "Task" },
    { key: "employee", label: "Assigned To", render: (r) => r.employee?.employeeCode || "—" },
    { key: "project", label: "Project", render: (r) => r.project?.name || "—" },
    {
      key: "status",
      label: "Status",
      render: (r) => <span className="tag-chip">{r.status.replace("_", " ")}</span>,
    },
    { key: "progress", label: "Progress", render: (r) => `${r.progress}%` },
  ];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      title: row.title,
      description: row.description || "",
      employee: row.employee?._id || row.employee,
      project: row.project?._id || row.project || "",
      dueDate: row.dueDate ? row.dueDate.slice(0, 10) : "",
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = { ...form, project: form.project || undefined };
    try {
      if (editing) {
        await api.put(`/tasks/${editing._id}`, payload);
        toast.success("Task updated.");
      } else {
        await api.post("/tasks", payload);
        toast.success("Task assigned.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e2) => (fieldErrors[e2.path] = e2.msg));
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${confirmTarget._id}`);
      toast.success("Task deleted.");
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete task.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Tasks</h1>
          <p className="text-sm text-cloud-500 mt-1">Assign and track work across your team.</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <LuPlus className="h-4 w-4" /> Assign Task
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onEdit={openEdit}
        onDelete={setConfirmTarget}
      />

      <Modal open={modalOpen} title={editing ? "Edit Task" : "Assign Task"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={form[field.name]}
              onChange={(name, value) => setForm((f) => ({ ...f, [name]: value }))}
              error={errors[field.name]}
            />
          ))}
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete task?"
        message={`This will permanently delete "${confirmTarget?.title}".`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
