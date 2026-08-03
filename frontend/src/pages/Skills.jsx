import { useMemo } from "react";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import SkillGroup from "../components/sections/SkillGroup";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getSkills } from "../utils/api";

export default function Skills() {
  const { data: skills, loading } = useApiData(getSkills, []);

  const skillGroups = useMemo(() => {
    if (!skills || !skills.length) return [];
    const map = new Map();
    skills.forEach((s) => {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category).push(s);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [skills]);

  return (
    <>
      <Seo
        title="Skills"
        path="/skills"
        description="Technical skills across frontend, backend, databases, cloud, and developer tools."
      />

      <Section
        title="My Skills"
        subtitle="Technologies I use daily to design, build, and ship full stack applications."
      >
        {loading ? (
          <SectionLoader />
        ) : skillGroups.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <div className="flex flex-col gap-6">
            {skillGroups.map((group, i) => (
              <SkillGroup key={group.category} group={group} delay={i * 0.06} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
