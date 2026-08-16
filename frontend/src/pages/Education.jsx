import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import TimelineItem from "../components/sections/TimelineItem";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getEducation } from "../utils/api";
import { formatPeriod } from "../utils/date";

export default function Education() {
  const { data: education, loading } = useApiData(getEducation, []);
  const list = education || [];

  return (
    <>
      <Seo
        title="Education"
        path="/education"
        description="Educational background and qualifications."
      />

      <Section title="Education">
        {loading ? (
          <SectionLoader />
        ) : list.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <div className="max-w-2xl">
            {list.map((item, i) => (
              <TimelineItem
                key={item._id}
                period={formatPeriod(item.startDate, item.endDate, false)}
                title={item.degree}
                subtitle={item.institution}
                detail={[item.field, item.grade, item.description].filter(Boolean).join(" — ")}
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
