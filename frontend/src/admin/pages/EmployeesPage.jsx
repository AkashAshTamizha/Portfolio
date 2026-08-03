import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuPower } from "react-icons/lu";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import ConfirmDialog from "../components/ConfirmDialog";
import { api } from "../api/client";

const CREATE_FIELDS = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Password", type: "text", required: true, helpText: "At least 8 characters." },
  { name: "employeeCode", label: "Employee Code", required: true, placeholder: "EMP-1042" },
  { name: "designation", label: "Designation / Job Role" },
  { name: "experience", label: "Years of Experience", type: "number" },
];

const EDIT_FIELDS = [
  { name: "designation", label: "Designation / Job Role" },
  { name: "experience", label: "Years of Experience", type: "number" },
  { name: "about", label: "About / Bio", type: "textarea" },
];

const EMPTY_CREATE = { name: "", email: "", password: "", employeeCode: "", designation: "", experience: 0 };

export default function EmployeesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_CREATE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/employees?limit=200")
      .then((res) => setRows(res.data || []))
      .catch((err) => toast.error(err.message || "Could not load employees."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const re = new RegExp(search, "i");
    return rows.filter((r) => re.test(r.user?.name || "") || re.test(r.employeeCode || "") || re.test(r.designation || ""));
  }, [rows, search]);

  const columns = [
    { key: "name", label: "Name", render: (r) => r.user?.name || "—" },
    { key: "employeeCode", label: "Code" },
    { key: "designation", label: "Designation" },
    { key: "experience", label: "Experience", render: (r) => `${r.experience || 0} yrs` },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <button
          onClick={() => handleToggleStatus(r)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
            r.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-cloud-500/10 text-cloud-400"
          }`}
        >
          <LuPower className="h-3 w-3" />
          {r.status}
        </button>
      ),
    },
  ];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_CREATE);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      designation: row.designation || "",
      experience: row.experience || 0,
      about: row.about || "",
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await api.put(`/employees/${editing._id}`, form);
        toast.success("Employee updated.");
      } else {
        await api.post("/employees", form);
        toast.success("Employee created.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e2) => (fieldErrors[e2.path] = e2.msg));
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Could not save employee.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(row) {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/employees/${row._id}/status`, { status: nextStatus });
      toast.success(`Marked as ${nextStatus}.`);
      load();
    } catch (err) {
      toast.error(err.message || "Could not update status.");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/employees/${confirmTarget._id}`);
      toast.success("Employee deleted.");
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete employee.");
    } finally {
      setDeleting(false);
    }
  }

  const fields = editing ? EDIT_FIELDS : CREATE_FIELDS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Employees</h1>
          <p className="text-sm text-cloud-500 mt-1">Add, edit, and manage employee accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <LuPlus className="h-4 w-4" /> Add Employee
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

      <Modal open={modalOpen} title={editing ? "Edit Employee" : "Add Employee"} onClose={() => setModalOpen(false)}>
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
        title="Delete employee?"
        message={`This will remove ${confirmTarget?.user?.name || "this employee"} and deactivate their login. This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
