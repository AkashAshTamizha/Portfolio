import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import ServiceCard from "../components/sections/ServiceCard";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getServices } from "../utils/api";

export default function Services() {
  const { data: services, loading } = useApiData(getServices, []);

  return (
    <>
      <Seo
        title="Services"
        path="/services"
        description="Full stack development services — web apps, APIs, database design, and performance optimization."
      />

      <Section
        title="Services"
        subtitle="How I can help your team ship faster, without cutting corners on quality."
      >
        {loading ? (
          <SectionLoader />
        ) : !services || services.length === 0 ? (
          <EmptyState message="No data available." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={service._id} service={service} delay={i * 0.06} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
