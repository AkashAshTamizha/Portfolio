import { FiDownload } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Section from "../components/ui/Section";
import Reveal from "../components/ui/Reveal";
import TimelineItem from "../components/sections/TimelineItem";
import EmptyState from "../components/ui/EmptyState";
import SectionLoader from "../components/ui/SectionLoader";
import { useProfile } from "../hooks/useProfile";
import { useApiData } from "../hooks/useApiData";
import { getExperience, getSkills, assetUrl } from "../utils/api";
import { formatPeriod } from "../utils/date";

export default function Resume() {
  const { profile, loading: profileLoading, hasProfile } = useProfile();
  const { data: experience, loading: expLoading } = useApiData(getExperience, []);
  const { data: skills, loading: skillsLoading } = useApiData(getSkills, []);

  const loading = profileLoading || expLoading || skillsLoading;
  const experienceList = experience || [];
  const topSkills = (skills || []).slice().sort((a, b) => b.level - a.level).slice(0, 10);
  const resumeUrl = assetUrl(profile?.resumeUrl);

  if (loading) return <SectionLoader />;

  return (
    <>
      <Seo
        title="Resume"
        path="/resume"
        description="Downloadable resume."
      />

      <Section eyebrow="// 09. resume" title="Resume">
        {!hasProfile ? (
          <EmptyState message="No data available." />
        ) : (
          <>
            <Reveal className="card-surface p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-14">
              <div>
                <h3 className="text-lg font-semibold font-display">{profile.name}</h3>
                <p className="text-sm text-cloud-500 mt-1">
                  {[profile.role, profile.yearsExperience ? `${profile.yearsExperience}+ years experience` : null, profile.location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {resumeUrl && (
                <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
                  Download PDF <FiDownload className="h-4 w-4" />
                </a>
              )}
            </Reveal>

            <div className="grid lg:grid-cols-[1fr_320px] gap-14">
              <div>
                {profile.bio && (
                  <Reveal>
                    <h3 className="text-xl font-semibold font-display mb-2">Summary</h3>
                    <p className="text-cloud-500 leading-relaxed mb-10">{profile.bio}</p>
                  </Reveal>
                )}

                <h3 className="text-xl font-semibold font-display mb-6">Experience</h3>
                {experienceList.length === 0 ? (
                  <EmptyState message="No data available." />
                ) : (
                  experienceList.map((item, i) => (
                    <TimelineItem
                      key={item._id}
                      period={formatPeriod(item.startDate, item.endDate, item.current)}
                      title={item.role}
                      subtitle={item.company}
                      points={item.achievements?.length ? item.achievements : undefined}
                      detail={!item.achievements?.length ? item.description : undefined}
                      delay={i * 0.06}
                      isLast={i === experienceList.length - 1}
                    />
                  ))
                )}
              </div>

              {topSkills.length > 0 && (
                <Reveal delay={0.1}>
                  <div className="card-surface p-6 sticky top-24">
                    <h3 className="font-mono text-xs text-blue-400 mb-4">{"// top-skills"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {topSkills.map((s) => (
                        <span key={s._id} className="tag-chip">{s.name}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
