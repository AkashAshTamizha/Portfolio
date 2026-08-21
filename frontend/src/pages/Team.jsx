import { useMemo } from "react";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import EmployeeCard from "../components/sections/EmployeeCard";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getEmployees } from "../utils/api";

export default function Team() {
  const { data: employees, loading } = useApiData(() => getEmployees("limit=200"), []);
  const list = useMemo(() => employees || [], [employees]);

  return (
    <>
      <Seo title="Our Team" path="/team" description="Meet the team behind our projects." />

      <Section  title="Our Team" subtitle="The people behind the work.">
        {loading ? (
          <SectionLoader />
        ) : list.length === 0 ? (
          <EmptyState message="No team members published yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((employee, i) => (
              <EmployeeCard key={employee._id} employee={employee} delay={i * 0.06} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
