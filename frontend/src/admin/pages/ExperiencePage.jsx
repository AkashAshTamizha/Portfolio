import ResourceManager from "../components/ResourceManager";

const columns = [
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "startDate", label: "Start", render: (row) => (row.startDate ? row.startDate.slice(0, 10) : "—") },
  { key: "current", label: "Current", render: (row) => (row.current ? "Yes" : "No") },
];

const fields = [
  { name: "company", label: "Company", type: "text", required: true },
  { name: "role", label: "Role / Title", type: "text", required: true },
  { name: "location", label: "Location", type: "text" },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "endDate", label: "End date", type: "date", helpText: "Leave blank if current" },
  { name: "current", label: "I currently work here", type: "checkbox" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "achievements", label: "Key achievements", type: "tags", placeholder: "One per comma" },
  { name: "order", label: "Display order", type: "number" },
];

export default function ExperiencePage() {
  return (
    <ResourceManager
      title="Experience"
      description="Your work history and achievements."
      apiPath="/experience"
      columns={columns}
      fields={fields}
    />
  );
}
