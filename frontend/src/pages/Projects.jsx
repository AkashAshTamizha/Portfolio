import { useMemo, useState } from "react";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import ProjectCard from "../components/sections/ProjectCard";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getProjects } from "../utils/api";

export default function Projects() {
  const { data: projects, loading } = useApiData(getProjects, []);
  const list = useMemo(() => projects || [], [projects]);

  const categories = useMemo(
    () => ["All", ...new Set(list.filter((p) => p.category).map((p) => p.category))],
    [list]
  );
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? list : list.filter((p) => p.category === active);

  return (
    <>
      <Seo
        title="Projects"
        path="/projects"
        description="Explore full stack projects and case studies."
      />

      <Section  title="Projects">
        {loading ? (
          <SectionLoader />
        ) : list.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                      active === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-ink-700 [html.light_&]:border-paper-300 bg-ink-800 text-cloud-300 hover:border-blue-400 hover:text-blue-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <ProjectCard key={project._id} project={project} delay={i * 0.06} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-cloud-500 py-16">No projects in this category yet.</p>
            )}
          </>
        )}
      </Section>
    </>
  );
}
