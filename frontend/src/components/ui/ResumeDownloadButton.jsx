import { FiDownload } from "react-icons/fi";
import { assetUrl } from "../../utils/api";

export default function ResumeDownloadButton({ resume, className = "" }) {
  if (!resume?.url) return null;

  return (
    <a
      href={assetUrl(resume.url)}
      download={resume.originalName || "resume"}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-secondary ${className}`}
    >
      <FiDownload className="h-4 w-4" /> Download Resume
    </a>
  );
}
