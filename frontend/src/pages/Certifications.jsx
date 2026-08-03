import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import CertificationCard from "../components/sections/CertificationCard";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getCertifications } from "../utils/api";

export default function Certifications() {
  const { data: certifications, loading } = useApiData(getCertifications, []);
  const list = certifications || [];

  return (
    <>
      <Seo
        title="Certifications"
        path="/certifications"
        description="Professional certifications and credentials."
      />

      <Section title="Certifications">
        {loading ? (
          <SectionLoader />
        ) : list.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((cert, i) => (
              <CertificationCard key={cert._id} cert={cert} delay={i * 0.06} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
