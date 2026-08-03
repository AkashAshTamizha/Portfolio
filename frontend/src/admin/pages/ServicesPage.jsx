import ResourceManager from "../components/ResourceManager";

const columns = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "featured", label: "Featured", render: (row) => (row.featured ? "Yes" : "No") },
];

const fields = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "icon", label: "Icon name", type: "text", placeholder: "e.g. LuCode (react-icons/lu)" },
  { name: "featured", label: "Featured", type: "checkbox" },
  { name: "order", label: "Display order", type: "number" },
];

export default function ServicesPage() {
  return (
    <ResourceManager
      title="Services"
      description="Services you offer, shown on the public site."
      apiPath="/services"
      columns={columns}
      fields={fields}
    />
  );
}
