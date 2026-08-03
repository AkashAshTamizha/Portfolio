import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

export default function MyProjectsPage() {
  const { employee } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee) return;
    api
      .get(`/employees/${employee._id}/projects`)
      .then((res) => setProjects(res.data || []))
      .finally(() => setLoading(false));
  }, [employee]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold font-display">My Projects</h1>
        <p className="text-sm text-cloud-500 mt-1">Projects you&apos;ve been assigned to (view-only).</p>
      </div>

      {loading ? (
        <p className="text-sm text-cloud-500">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-cloud-500">You haven&apos;t been assigned to any projects yet.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const membership = project.team?.find(
              (t) => (t.employee?._id || t.employee) === employee._id
            );
            return (
              <div key={project._id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-cloud-100">{project.name}</p>
                    {membership?.role && <p className="text-sm text-cloud-500">{membership.role}</p>}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 shrink-0">
                    {project.status?.replace("_", " ") || "planned"}
                  </span>
                </div>
                {project.description && <p className="text-sm text-cloud-500 mt-2">{project.description}</p>}
                {membership?.contribution && (
                  <p className="text-sm text-cloud-500 mt-2">
                    <span className="text-cloud-400">Your contribution: </span>
                    {membership.contribution}
                  </p>
                )}
                {project.tech?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="tag-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
