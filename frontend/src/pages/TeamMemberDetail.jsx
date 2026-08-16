import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiPhone, FiClock } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Reveal from "../components/ui/Reveal";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import RatingStars from "../components/ui/RatingStars";
import ReviewCard from "../components/ui/ReviewCard";
import ReviewForm from "../components/ui/ReviewForm";
import ResumeDownloadButton from "../components/ui/ResumeDownloadButton";
import SocialLinks from "../components/ui/SocialLinks";
import StatCard from "../components/ui/StatCard";
import SkillGroup from "../components/sections/SkillGroup";
import TimelineItem from "../components/sections/TimelineItem";
import CertificationCard from "../components/sections/CertificationCard";
import ProjectCard from "../components/sections/ProjectCard";
import { useUserAuth } from "../hooks/useUserAuth";
import {
  getEmployee,
  getEmployeeProjects,
  getReviewsFor,
  assetUrl,
  deleteReview as apiDeleteReview,
} from "../utils/api";
import { formatPeriod } from "../utils/date";

export default function TeamMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([getEmployee(id), getEmployeeProjects(id), getReviewsFor("employee", id)])
      .then(([e, p, r]) => {
        setEmployee(e);
        setProjects(p);
        setReviews(r);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteReview(review) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiDeleteReview(review._id);
      load();
    } catch {
      // ReviewForm's toast already surfaces most errors; silent no-op here is fine for a delete confirm flow
    }
  }

  const myReview = reviews.find((r) => r.user?._id === user?.id) || null;

  function handleEditReview() {
    document.getElementById("review-form-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const skillGroups = useMemo(() => {
    const levelToScore = { beginner: 2, intermediate: 3, advanced: 4, expert: 5 };
    const map = new Map();
    (employee?.skills || []).forEach((s) => {
      const category = s.skill?.category || "Other";
      if (!map.has(category)) map.set(category, []);
      map.get(category).push({ name: s.skill?.name, level: levelToScore[s.level] || 3 });
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [employee]);

  if (loading) return <SectionLoader />;

  if (notFound || !employee) {
    return (
      <div className="section-pad container-content">
        <EmptyState message="No data available for this team member." />
        <div className="text-center mt-6">
          <button onClick={() => navigate("/team")} className="btn-secondary">
            <FiArrowLeft className="h-4 w-4" /> Back to Team
          </button>
        </div>
      </div>
    );
  }

  const photo = assetUrl(employee.photo);
  const name = employee.user?.name || employee.employeeCode;
  const socials = Object.fromEntries((employee.socialLinks || []).map((s) => [s.platform, s.url]));

  const projectCategories = ["All", ...new Set(projects.filter((p) => p.category).map((p) => p.category))];
  const filteredProjects = activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory);

  const experienceItems = [...projects]
    .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))
    .map((project) => {
      const membership = project.team?.find(
        (t) => t.employee === employee._id || t.employee?._id === employee._id
      );
      return { project, membership };
    });

  return (
    <>
      <Seo title={name} path={`/team/${employee._id}`} description={employee.about} />

      <div className="section-pad">
        <div className="container-content">
          <Reveal>
            <Link to="/team" className="inline-flex items-center gap-2 text-sm text-cloud-500 hover:text-blue-400 mb-8">
              <FiArrowLeft className="h-4 w-4" /> Back to Team
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* <div className="h-28 w-28 rounded-full overflow-hidden bg-ink-800 [html.light_&]:bg-paper-200 border border-ink-700 [html.light_&]:border-paper-300 shrink-0">
                {photo ? (
                  <img src={photo} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-display text-cloud-500">
                    {name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div> */}
 <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
  <Reveal>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-ink-700 [html.light_&]:border-paper-300 bg-ink-800 [html.light_&]:bg-paper-200 flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="h-full w-full object-cover"
                      
                    />
                  ) : null}
                  <div
                    className="h-full w-full items-center justify-center font-mono text-5xl text-cloud-500"
                    style={{ display: photo ? "none" : "flex" }}
                  >
                    {name?.slice(0, 2).toUpperCase() || "?"}
                  </div>
                </div>
              </Reveal>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{name}</h1>
                {employee.designation && <p className="mt-1 text-cloud-400">{employee.designation}</p>}
                {employee.experience > 0 && (
                  <p className="text-sm text-cloud-600 mt-1">{employee.experience} years of experience</p>
                )}
                <div className="mt-3">
                  <RatingStars value={employee.stats?.avgRating || 0} count={employee.stats?.reviewCount} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <SocialLinks socials={socials} />
                  <ResumeDownloadButton resume={employee.resume} />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <StatCard value={`${employee.experience || 0}+`} label="Years Experience" />
            <StatCard value={`${employee.stats?.totalProjects ?? projects.length}`} label="Projects" />
            <StatCard value={(employee.stats?.avgRating || 0).toFixed(1)} label="Avg Rating" />
            <StatCard value={`${employee.stats?.reviewCount ?? reviews.length}`} label="Reviews" />
          </Reveal>

          {skillGroups.length > 0 && (
            <Reveal delay={0.12} className="mt-14">
              <h2 className="text-xl font-semibold font-display mb-5">Skills</h2>
              <div className="flex flex-col gap-6">
                {skillGroups.map((group, i) => (
                  <SkillGroup key={group.category} group={group} delay={i * 0.06} />
                ))}
              </div>
            </Reveal>
          )}

          {projects.length > 0 && (
            <Reveal delay={0.14} className="mt-14">
              <h2 className="text-xl font-semibold font-display mb-5">
                Projects ({employee.stats?.totalProjects ?? projects.length})
              </h2>

              {projectCategories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {projectCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                        activeCategory === cat
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
                {filteredProjects.map((project, i) => (
                  <ProjectCard key={project._id} project={project} delay={i * 0.06} />
                ))}
              </div>
            </Reveal>
          )}

          <div className="grid lg:grid-cols-[1fr_320px] gap-12 mt-14">
            <div className="space-y-10">
              {employee.about && (
                <Reveal>
                  <h2 className="text-xl font-semibold font-display mb-3">About</h2>
                  <p className="text-cloud-500 leading-relaxed">{employee.about}</p>
                </Reveal>
              )}

              <Reveal delay={0.05}>
                <h2 className="text-xl font-semibold font-display mb-3">Experience</h2>
                {experienceItems.length === 0 ? (
                  <p className="text-sm text-cloud-500">No project experience listed yet.</p>
                ) : (
                  <div className="max-w-2xl">
                    {experienceItems.map(({ project, membership }, i) => (
                      <TimelineItem
                        key={project._id}
                        period={formatPeriod(project.startDate, project.endDate, project.status === "in_progress")}
                        title={membership?.role || "Contributor"}
                        subtitle={project.name}
                        detail={membership?.contribution || project.description}
                        delay={i * 0.06}
                        isLast={i === experienceItems.length - 1}
                      />
                    ))}
                  </div>
                )}
              </Reveal>

              {employee.education?.length > 0 && (
                <Reveal delay={0.08}>
                  <h2 className="text-xl font-semibold font-display mb-3">Education</h2>
                  <div className="max-w-2xl">
                    {employee.education.map((item, i) => (
                      <TimelineItem
                        key={item._id || i}
                        period={formatPeriod(item.startDate, item.endDate, false)}
                        title={item.degree}
                        subtitle={item.institution}
                        detail={[item.field, item.grade, item.description].filter(Boolean).join(" — ")}
                        delay={i * 0.06}
                        isLast={i === employee.education.length - 1}
                      />
                    ))}
                  </div>
                </Reveal>
              )}

              {employee.certifications?.length > 0 && (
                <Reveal delay={0.09}>
                  <h2 className="text-xl font-semibold font-display mb-3">Certifications</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {employee.certifications.map((cert, i) => (
                      <CertificationCard key={cert._id || i} cert={cert} delay={i * 0.06} />
                    ))}
                  </div>
                </Reveal>
              )}

              <Reveal delay={0.1}>
                <h2 className="text-xl font-semibold font-display mb-3">Reviews ({reviews.length})</h2>
                <div className="space-y-4 mb-6">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-cloud-500">No reviews yet — be the first to leave one.</p>
                  ) : (
                    reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        canManage={user?.id === review.user?._id}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    ))
                  )}
                </div>
                <div id="review-form-anchor">
                  <ReviewForm
                    key={myReview?._id || "new"}
                    targetType="employee"
                    targetId={employee._id}
                    myReview={myReview}
                    onSubmitted={load}
                  />
                </div>
              </Reveal>
            </div>

            <div className="space-y-6 sticky top-24">
              {(employee.contact?.phone || employee.contact?.location || employee.contact?.availability) && (
                <Reveal delay={0.08}>
                  <div className="card-surface p-6">
                    <h3 className="font-mono text-xs text-blue-400 mb-4">{"// contact"}</h3>
                    <div className="space-y-3">
                      {employee.contact?.location && (
                        <div className="flex items-center gap-3 text-sm text-cloud-400">
                          <FiMapPin className="h-4 w-4 text-cloud-600 shrink-0" />
                          <span>{employee.contact.location}</span>
                        </div>
                      )}
                      {employee.contact?.phone && (
                        <div className="flex items-center gap-3 text-sm text-cloud-400">
                          <FiPhone className="h-4 w-4 text-cloud-600 shrink-0" />
                          <span>{employee.contact.phone}</span>
                        </div>
                      )}
                      {employee.contact?.availability && (
                        <div className="flex items-center gap-3 text-sm text-cloud-400">
                          <FiClock className="h-4 w-4 text-cloud-600 shrink-0" />
                          <span>{employee.contact.availability}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
