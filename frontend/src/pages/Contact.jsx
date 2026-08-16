import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import Reveal from "../components/ui/Reveal";
import ContactForm from "../components/sections/ContactForm";
import SocialLinks from "../components/ui/SocialLinks";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useApiData } from "../hooks/useApiData";
import { getContactInfo } from "../utils/api";

export default function Contact() {
  const { data: info, loading } = useApiData(getContactInfo, []);
  const hasContactInfo = info && (info.email || info.phone || info.location);

  return (
    <>
      <Seo
        title="Contact Me"
        path="/contact"
        description="Get in touch for opportunities, freelance work, or collaboration."
      />

      <Section title="Contact Me">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12">
          <Reveal>
            <h3 className="text-xl font-semibold font-display mb-3">Let&apos;s get in touch</h3>
            <p className="text-cloud-500 leading-relaxed mb-8">
              I&apos;m always open to discussing new opportunities, interesting projects, or just talking
              tech. Drop a message and I&apos;ll respond within a day or two.
            </p>

            {loading ? (
              <SectionLoader />
            ) : !hasContactInfo ? (
              <EmptyState message="No data available." />
            ) : (
              <div className="space-y-4">
                {info.email && (
                  <a href={`mailto:${info.email}`} className="flex items-center gap-4 card-surface p-4 hover:border-blue-400 transition-colors">
                    <span className="h-10 w-10 rounded-lg bg-brand-gradient text-white flex items-center justify-center shadow-glow shrink-0">
                      <FiMail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-cloud-500">Email</p>
                      <p className="text-sm">{info.email}</p>
                    </div>
                  </a>
                )}

                {info.phone && (
                  <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 card-surface p-4 hover:border-blue-400 transition-colors">
                    <span className="h-10 w-10 rounded-lg bg-brand-gradient text-white flex items-center justify-center shadow-glow shrink-0">
                      <FiPhone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-cloud-500">Phone</p>
                      <p className="text-sm">{info.phone}</p>
                    </div>
                  </a>
                )}

                {info.location && (
                  <div className="flex items-center gap-4 card-surface p-4">
                    <span className="h-10 w-10 rounded-lg bg-brand-gradient text-white flex items-center justify-center shadow-glow shrink-0">
                      <FiMapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-cloud-500">Location</p>
                      <p className="text-sm">{info.location}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <p className="text-xs font-mono text-cloud-500 mb-3">{"// follow-me"}</p>
              <SocialLinks socials={info?.socials} />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
