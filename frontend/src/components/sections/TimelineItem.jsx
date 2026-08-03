import { memo } from "react";
import Reveal from "../ui/Reveal";

function TimelineItem({ period, title, subtitle, location, points, detail, isLast, delay = 0 }) {
  return (
    <Reveal delay={delay} className="relative grid grid-cols-[88px_24px_1fr] sm:grid-cols-[120px_24px_1fr] gap-x-4 pb-12 last:pb-0">
      {/* Date column */}
      <p className="font-mono text-xs text-blue-400 pt-1 text-right">{period}</p>

      {/* Line + dot column */}
      <div className="relative flex justify-center">
        {!isLast && (
          <span className="absolute top-1 bottom-0 w-px bg-ink-700 [html.light_&]:bg-paper-300" />
        )}
        <span className="relative z-10 h-4 w-4 rounded-full border-2 border-blue-400 bg-ink-950 [html.light_&]:bg-paper-50" />
      </div>

      {/* Content column */}
      <div>
        <h3 className="text-lg font-semibold font-display">{title}</h3>
        {subtitle && <p className="text-sm text-violet-400 mt-0.5">{subtitle}</p>}
        {location && <p className="text-xs text-cloud-500 mt-0.5">{location}</p>}
        {detail && <p className="text-sm text-cloud-500 mt-2 leading-relaxed">{detail}</p>}

        {points && (
          <ul className="mt-3 space-y-2">
            {points.map((point, i) => (
              <li key={i} className="text-sm text-cloud-500 leading-relaxed flex gap-2">
                <span className="text-blue-400 mt-1.5 h-1 w-1 rounded-full bg-blue-400 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

export default memo(TimelineItem);
