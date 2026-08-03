import { FiGithub, FiLinkedin, FiTwitter, FiInstagram } from "react-icons/fi";
import { useProfile } from "../../hooks/useProfile";

const iconMap = {
  github: FiGithub,
  linkedin: FiLinkedin,
  twitter: FiTwitter,
  instagram: FiInstagram,
};

export default function SocialLinks({ className = "", iconClassName = "h-4 w-4", socials }) {
  const { profile } = useProfile();
  const links = socials || profile?.socials || {};
  const entries = Object.entries(links).filter(([, url]) => url);

  if (!entries.length) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {entries.map(([key, url]) => {
        const Icon = iconMap[key];
        if (!Icon) return null;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-ink-700 [html.light_&]:border-paper-300 text-cloud-300 hover:text-blue-400 hover:border-blue-400 transition-colors duration-200"
          >
            <Icon className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}
