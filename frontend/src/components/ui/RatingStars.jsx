import { useState } from "react";
import { FiStar } from "react-icons/fi";

// Read-only mode (default): shows a static star rating with the numeric
// average. Interactive mode (onChange supplied): lets a registered user
// pick a 1-5 score by clicking a star.
export default function RatingStars({ value = 0, count, size = "h-4 w-4", onChange }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const display = interactive ? hover || value : value;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <FiStar
            key={n}
            className={`${size} ${n <= Math.round(display) ? "fill-blue-400 text-blue-400" : "text-cloud-600"} ${
              interactive ? "cursor-pointer transition-transform hover:scale-110" : ""
            }`}
            onMouseEnter={interactive ? () => setHover(n) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            onClick={interactive ? () => onChange(n) : undefined}
          />
        ))}
      </div>
      {!interactive && (
        <span className="text-sm text-cloud-400">
          {value > 0 ? value.toFixed(1) : "No ratings yet"}
          {count !== undefined && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
