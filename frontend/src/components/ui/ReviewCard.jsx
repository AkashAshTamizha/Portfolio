import { FiTrash2, FiEdit2 } from "react-icons/fi";
import RatingStars from "./RatingStars";
import { formatDateTime } from "../../utils/date";

export default function ReviewCard({ review, canManage = false, onEdit, onDelete }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-cloud-100">{review.user?.name || "Anonymous"}</p>
          {typeof review.score === "number" && review.score > 0 && (
            <RatingStars value={review.score} size="h-3.5 w-3.5" />
          )}
          <p className="text-xs text-cloud-500 mt-1">{formatDateTime(review.createdAt)}</p>
        </div>
        {canManage && (
          <div className="flex gap-1.5 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-blue-400"
                aria-label="Edit review"
              >
                <FiEdit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review)}
                className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400"
                aria-label="Delete review"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-cloud-400 leading-relaxed">{review.text}</p>
    </div>
  );
}
