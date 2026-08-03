import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";
import { useUserAuth } from "../../hooks/useUserAuth";
import { submitRating, submitReview, updateReview } from "../../utils/api";

// `myReview` (optional) is the current viewer's own existing review for this
// target, if any — found by the parent from the reviews list it already
// fetched. When present, the form switches into edit mode: it's pre-filled,
// submitting calls updateReview instead of submitReview, and the duplicate-
// review error the backend would otherwise throw never has a chance to fire.
//
// NOTE: `score`/`text` intentionally read `myReview` only in the useState
// initializer, not in an effect. If the caller re-renders with a *different*
// `myReview` (e.g. switching between targets), it should pass
// `key={myReview?._id || "new"}` so React remounts this form with a fresh
// initial state instead of us reaching for useEffect to resync it.
export default function ReviewForm({ targetType, targetId, myReview, onSubmitted }) {
  const { isAuthenticated } = useUserAuth();
  const isEditing = Boolean(myReview);
  const [score, setScore] = useState(myReview?.score || 0);
  const [text, setText] = useState(myReview?.text || "");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="card-surface p-5 text-sm text-cloud-400">
        <Link to="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>{" "}
        to rate and review.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!score) return toast.error("Please select a star rating.");
    if (text.trim().length < 3) return toast.error("Review must be at least 3 characters.");

    setSubmitting(true);
    try {
      // Ratings always upsert on the backend, so this is safe whether the
      // viewer is rating for the first time or changing an earlier score.
      await submitRating({ targetType, target: targetId, score });
      if (isEditing) {
        await updateReview(myReview._id, { text: text.trim() });
        toast.success("Review updated.");
      } else {
        await submitReview({ targetType, target: targetId, text: text.trim() });
        toast.success("Thanks for your feedback!");
        setScore(0);
        setText("");
      }
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-5 space-y-4">
      <p className="text-sm font-medium text-cloud-100">
        {isEditing ? "Edit your review" : "Leave a review"}
      </p>
      <div>
        <p className="text-sm font-medium text-cloud-300 mb-2">Your rating</p>
        <RatingStars value={score} onChange={setScore} size="h-6 w-6" />
      </div>
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-cloud-300 mb-2">
          Your review
        </label>
        <textarea
          id="review-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience…"
          className="w-full rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5 text-sm text-cloud-100 placeholder:text-cloud-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? "Saving…" : isEditing ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
