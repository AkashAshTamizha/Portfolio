import ResourceManager from "../components/ResourceManager";

const columns = [
  { key: "category", label: "Category" },
  { key: "name", label: "Skill" },
  { key: "level", label: "Level", render: (row) => `${row.level} / 5` },
];

const fields = [
  { name: "category", label: "Category", type: "text", required: true, placeholder: "e.g. Frontend" },
  { name: "name", label: "Skill name", type: "text", required: true, placeholder: "e.g. React.js" },
  { name: "level", label: "Proficiency (1–5)", type: "number", required: true },
  { name: "order", label: "Display order", type: "number" },
];

export default function SkillsPage() {
  return (
    <ResourceManager
      title="Skills"
      description="Group and rate the skills shown on your portfolio."
      apiPath="/skills"
      columns={columns}
      fields={fields}
    />
  );
}
