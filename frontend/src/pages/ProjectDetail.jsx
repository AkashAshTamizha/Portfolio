import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiGithub, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Reveal from "../components/ui/Reveal";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import RatingStars from "../components/ui/RatingStars";
import ReviewCard from "../components/ui/ReviewCard";
import ReviewForm from "../components/ui/ReviewForm";
import { useUserAuth } from "../hooks/useUserAuth";
import { getProject, getReviewsFor, deleteReview as apiDeleteReview, assetUrl } from "../utils/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([getProject(id), getReviewsFor("project", id)])
      .then(([p, r]) => {
        setProject(p);
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
      // ReviewForm's toast already surfaces most errors here
    }
  }

  const myReview = reviews.find((r) => r.user?._id === user?.id) || null;

  function handleEditReview() {
    document.getElementById("review-form-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) return <SectionLoader />;

  if (notFound || !project) {
    return (
      <div className="section-pad container-content">
        <EmptyState message="No data available for this project." />
        <div className="text-center mt-6">
          <button onClick={() => navigate("/projects")} className="btn-secondary">
            <FiArrowLeft className="h-4 w-4" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const image = assetUrl(project.image);

  return (
    <>
      <Seo title={project.name} path={`/projects/${project._id}`} description={project.description} />

      <div className="section-pad">
        <div className="container-content">
          <Reveal>
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-cloud-500 hover:text-blue-400 mb-8">
              <FiArrowLeft className="h-4 w-4" /> Back to Projects
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            {(project.category || project.year) && (
              <p className="eyebrow mb-3">
                {"// "}
                {[project.category, project.year].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{project.name}</h1>
            <div className="mt-2">
              <RatingStars value={project.stats?.avgRating || 0} count={project.stats?.reviewCount} />
            </div>
            {project.description && (
              <p className="mt-4 text-cloud-500 max-w-2xl leading-relaxed">{project.description}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <FiGithub className="h-4 w-4" /> View Code
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <FiExternalLink className="h-4 w-4" /> Live Demo
                </a>
              )}
            </div>
          </Reveal>

          {image && (
            <Reveal delay={0.1} className="mt-10 rounded-2xl overflow-hidden border border-ink-700 [html.light_&]:border-paper-300 aspect-video bg-ink-800 [html.light_&]:bg-paper-200">
              <img
                src={image}
                alt={`${project.name} screenshot`}
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </Reveal>
          )}

          <div className="grid lg:grid-cols-[1fr_320px] gap-12 mt-14">
            <div className="space-y-10">
              {project.problem && (
                <Reveal>
                  <h2 className="text-xl font-semibold font-display mb-3">The Problem</h2>
                  <p className="text-cloud-500 leading-relaxed">{project.problem}</p>
                </Reveal>
              )}

              {project.features?.length > 0 && (
                <Reveal delay={0.05}>
                  <h2 className="text-xl font-semibold font-display mb-3">Key Features</h2>
                  <ul className="space-y-2.5">
                    {project.features.map((f) => (
                      <li key={f} className="flex gap-3 text-sm text-cloud-500 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {project.challenges && (
                <Reveal delay={0.1}>
                  <h2 className="text-xl font-semibold font-display mb-3">Challenges Solved</h2>
                  <p className="text-cloud-500 leading-relaxed">{project.challenges}</p>
                </Reveal>
              )}
            </div>

            {project.tech?.length > 0 && (
              <Reveal delay={0.1}>
                <div className="card-surface p-6 sticky top-24">
                  <h3 className="font-mono text-xs text-blue-400 mb-4">{"// tech-stack"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="tag-chip">{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.12} className="max-w-2xl mt-14">
            <h2 className="text-xl font-semibold font-display mb-5">Reviews ({reviews.length})</h2>
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
                targetType="project"
                targetId={project._id}
                myReview={myReview}
                onSubmitted={load}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
