import ResourceManager from "../components/ResourceManager";

const columns = [
  { key: "institution", label: "Institution" },
  { key: "degree", label: "Degree" },
  { key: "startDate", label: "Start", render: (row) => (row.startDate ? row.startDate.slice(0, 10) : "—") },
];

const fields = [
  { name: "institution", label: "Institution", type: "text", required: true },
  { name: "degree", label: "Degree", type: "text", required: true },
  { name: "field", label: "Field of study", type: "text" },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "endDate", label: "End date", type: "date" },
  { name: "grade", label: "Grade / GPA", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "order", label: "Display order", type: "number" },
];

export default function EducationPage() {
  return (
    <ResourceManager
      title="Education"
      description="Your academic background."
      apiPath="/education"
      columns={columns}
      fields={fields}
    />
  );
}
