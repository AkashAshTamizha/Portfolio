import { FiAward, FiExternalLink } from "react-icons/fi";
import Reveal from "../ui/Reveal";
import { formatMonthYear } from "../../utils/date";

export default function CertificationCard({ cert, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="card-surface p-6 flex items-start gap-4 h-full">
        <div className="h-11 w-11 rounded-lg bg-brand-gradient flex items-center justify-center text-white shadow-glow shrink-0">
          <FiAward className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold font-display leading-snug">{cert.name}</h3>
          <p className="text-xs text-cloud-500 mt-1">
            {cert.issuer}
            {cert.issueDate ? ` · ${formatMonthYear(cert.issueDate)}` : ""}
          </p>
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 mt-3 hover:underline"
            >
              View credential <FiExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}
