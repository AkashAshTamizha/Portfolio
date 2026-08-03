import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiStar, FiTrash2 } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Reveal from "../components/ui/Reveal";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import RatingStars from "../components/ui/RatingStars";
import { getMyReviews, deleteReview } from "../utils/api";
import { formatDateTime } from "../utils/date";

// Lets a logged-in viewer see and manage every review/rating they've left
// across all employees and projects, all in one place — deleting here is
// the same moderation-safe delete the item's own page uses (owner-only).
export default function MyReviews() {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getMyReviews()
      .then(setReviews)
      .catch((err) => toast.error(err.message || "Failed to load your reviews."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(review) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(review._id);
      toast.success("Review deleted.");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete review.");
    }
  }

  function targetHref(review) {
    if (!review.target?._id) return null;
    return review.targetType === "employee" ? `/team/${review.target._id}` : `/projects/${review.target._id}`;
  }

  function targetName(review) {
    if (!review.target) return "Deleted item";
    return review.targetType === "employee" ? review.target.user?.name || "Team member" : review.target.name;
  }

  return (
    <>
      <Seo title="My Reviews" path="/my-reviews" />
      <div className="section-pad">
        <div className="container-content max-w-3xl">
          <Reveal>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">My Reviews</h1>
            <p className="mt-2 text-cloud-500">
              Every rating and review you&apos;ve submitted for team members and projects.
            </p>
          </Reveal>

          {loading ? (
            <SectionLoader />
          ) : !reviews || reviews.length === 0 ? (
            <Reveal delay={0.05} className="mt-10">
              <EmptyState message="You haven't reviewed anything yet." />
            </Reveal>
          ) : (
            <Reveal delay={0.05} className="mt-10 space-y-4">
              {reviews.map((review) => {
                const href = targetHref(review);
                return (
                  <div key={review._id} className="card-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {href ? (
                          <Link to={href} className="font-semibold text-cloud-100 hover:text-blue-400">
                            {targetName(review)}
                          </Link>
                        ) : (
                          <p className="font-semibold text-cloud-500">{targetName(review)}</p>
                        )}
                        <p className="text-xs text-cloud-500 mt-0.5 capitalize">{review.targetType}</p>
                        {typeof review.score === "number" && review.score > 0 && (
                          <RatingStars value={review.score} size="h-3.5 w-3.5" />
                        )}
                        <p className="text-xs text-cloud-500 mt-1">{formatDateTime(review.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(review)}
                        className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400 shrink-0"
                        aria-label="Delete review"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-cloud-400 leading-relaxed">{review.text}</p>
                    {href && (
                      <Link
                        to={href}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                      >
                        <FiStar className="h-3.5 w-3.5" /> Edit on {review.targetType} page
                      </Link>
                    )}
                  </div>
                );
              })}
            </Reveal>
          )}
        </div>
      </div>
    </>
  );
}
