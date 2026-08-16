import { useState } from "react";
import { LuUsers } from "react-icons/lu";
import ResourceManager from "../components/ResourceManager";
import TeamAssignmentModal from "../components/TeamAssignmentModal";

const columns = [
  { key: "name", label: "Project" },
  { key: "category", label: "Category" },
  { key: "year", label: "Year" },
  { key: "status", label: "Status", render: (row) => row.status || "planned" },
  { key: "team", label: "Team", render: (row) => `${row.team?.length || 0} assigned` },
  { key: "featured", label: "Featured", render: (row) => (row.featured ? "Yes" : "No") },
];

const fields = [
  { name: "name", label: "Project name", type: "text", required: true },
  { name: "category", label: "Category", type: "text", placeholder: "e.g. MERN Stack" },
  { name: "year", label: "Year", type: "text" },
  { name: "client", label: "Client", type: "text", placeholder: "e.g. Internal, Acme Corp" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "planned", label: "Planned" },
      { value: "in_progress", label: "In progress" },
      { value: "completed", label: "Completed" },
      { value: "on_hold", label: "On hold" },
    ],
  },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "endDate", label: "End date", type: "date" },
  { name: "image", label: "Cover image", type: "image" },
  { name: "gallery", label: "Gallery images", type: "gallery" },
  { name: "description", label: "Short description", type: "textarea", required: true },
  { name: "problem", label: "Problem it solves", type: "textarea" },
  { name: "features", label: "Key features", type: "tags", placeholder: "One per comma" },
  { name: "challenges", label: "Challenges & solutions", type: "textarea" },
  { name: "tech", label: "Tech stack", type: "tags", placeholder: "e.g. React, Node.js, MongoDB" },
  { name: "github", label: "GitHub URL", type: "url" },
  { name: "demo", label: "Live demo URL", type: "url" },
  { name: "documents", label: "Attachments (PDF, docs)", type: "documents" },
  { name: "featured", label: "Featured on homepage", type: "checkbox" },
  { name: "order", label: "Display order", type: "number" },
];

export default function ProjectsPage() {
  const [teamProject, setTeamProject] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  return (
    <>
      <ResourceManager
        key={reloadTick}
        title="Projects"
        description="Case studies shown in your portfolio, with images, documents, and the employees who worked on them."
        apiPath="/projects"
        columns={columns}
        fields={fields}
        uploadType="projects"
        extraActions={(row) => (
          <button
            onClick={() => setTeamProject(row)}
            className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-blue-400"
            aria-label="Manage team"
            title="Manage team"
          >
            <LuUsers className="h-4 w-4" />
          </button>
        )}
      />

      <TeamAssignmentModal
        open={!!teamProject}
        project={teamProject}
        onClose={() => setTeamProject(null)}
        onChanged={() => setReloadTick((t) => t + 1)}
      />
    </>
  );
}
