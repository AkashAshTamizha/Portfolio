import ResourceManager from "../components/ResourceManager";

const columns = [
  { key: "name", label: "Certification" },
  { key: "issuer", label: "Issuer" },
  { key: "issueDate", label: "Issued", render: (row) => (row.issueDate ? row.issueDate.slice(0, 10) : "—") },
];

const fields = [
  { name: "name", label: "Certification name", type: "text", required: true },
  { name: "issuer", label: "Issuer", type: "text", required: true },
  { name: "issueDate", label: "Issue date", type: "date", required: true },
  { name: "expiryDate", label: "Expiry date", type: "date" },
  { name: "credentialId", label: "Credential ID", type: "text" },
  { name: "credentialUrl", label: "Credential URL", type: "url" },
  { name: "image", label: "Badge image", type: "image" },
  { name: "order", label: "Display order", type: "number" },
];

export default function CertificationsPage() {
  return (
    <ResourceManager
      title="Certifications"
      description="Professional certifications and badges."
      apiPath="/certifications"
      columns={columns}
      fields={fields}
      uploadType="certifications"
    />
  );
}
