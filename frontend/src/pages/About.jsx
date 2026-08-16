import { FiCheck } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import Reveal from "../components/ui/Reveal";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useProfile } from "../hooks/useProfile";
import { useApiData } from "../hooks/useApiData";
import { getSkills, getProjects, assetUrl } from "../utils/api";

export default function About() {
  const { profile, loading, hasProfile } = useProfile();
  const { data: skills } = useApiData(getSkills, []);
  const { data: projects } = useApiData(getProjects, []);
  const specializations = profile?.specializations || [];
  const avatar = assetUrl(profile?.avatar);

  return (
    <>
      <Seo
        title="About Me"
        path="/about"
        description={profile?.bio ? profile.bio.slice(0, 160) : "About me."}
      />

      <Section  title="About Me" align="center">
        {loading ? (
          <SectionLoader />
        ) : !hasProfile ? (
          <EmptyState message="No data available." />
        ) : (
          <>
            <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
              <Reveal>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-ink-700 [html.light_&]:border-paper-300 bg-ink-800 [html.light_&]:bg-paper-200 flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={profile?.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="h-full w-full items-center justify-center font-mono text-5xl text-cloud-500"
                    style={{ display: avatar ? "none" : "flex" }}
                  >
                    {profile?.initials || profile?.name?.slice(0, 2).toUpperCase() || "?"}
                  </div>
                </div>
              </Reveal>

              <div>
                <Reveal>
                  <h3 className="text-xl font-semibold font-display">Who am I?</h3>
                  <p className="mt-4 text-cloud-500 leading-relaxed">
                    {profile?.bio || "No bio available yet."}
                  </p>

                  <dl className="mt-6 space-y-3 text-sm">
                    {profile?.name && (
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-cloud-500">Name:</dt>
                        <dd className="text-cloud-100 [html.light_&]:text-cloud-900 font-medium">{profile.name}</dd>
                      </div>
                    )}
                    {profile?.email && (
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-cloud-500">Email:</dt>
                        <dd className="text-cloud-100 [html.light_&]:text-cloud-900 font-medium">{profile.email}</dd>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-cloud-500">Phone:</dt>
                        <dd className="text-cloud-100 [html.light_&]:text-cloud-900 font-medium">{profile.phone}</dd>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-cloud-500">Location:</dt>
                        <dd className="text-cloud-100 [html.light_&]:text-cloud-900 font-medium">{profile.location}</dd>
                      </div>
                    )}
                  </dl>
                </Reveal>

                {specializations.length > 0 && (
                  <Reveal delay={0.1} className="mt-8">
                    <h3 className="text-xl font-semibold font-display mb-4">What I specialize in</h3>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {specializations.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-cloud-500 leading-relaxed">
                          <FiCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}
              </div>
            </div>

            <Reveal delay={0.2} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              <StatCard value={`${profile?.yearsExperience || 0}+`} label="Years Experience" />
              <StatCard value={`${(projects || []).length}`} label="Projects Completed" />
              <StatCard value={`${(skills || []).length}`} label="Technologies" />
              <StatCard value={profile?.availability ? "Available" : "—"} label="Availability" />
            </Reveal>
          </>
        )}
      </Section>
    </>
  );
}
