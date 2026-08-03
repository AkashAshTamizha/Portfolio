import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import TimelineItem from "../components/sections/TimelineItem";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getExperience } from "../utils/api";
import { formatPeriod } from "../utils/date";

export default function Experience() {
  const { data: experience, loading } = useApiData(getExperience, []);
  const list = experience || [];

  return (
    <>
      <Seo
        title="Experience"
        path="/experience"
        description="Professional work experience and career history."
      />

      <Section title="My Experience">
        {loading ? (
          <SectionLoader />
        ) : list.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <div className="max-w-3xl">
            {list.map((item, i) => (
              <TimelineItem
                key={item._id}
                period={formatPeriod(item.startDate, item.endDate, item.current)}
                title={item.role}
                subtitle={item.company}
                location={item.location}
                points={item.achievements?.length ? item.achievements : undefined}
                detail={!item.achievements?.length ? item.description : undefined}
                delay={i * 0.08}
                isLast={i === list.length - 1}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
