import { Helmet } from "react-helmet-async";
import { useProfile } from "../../hooks/useProfile";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";
const FALLBACK_TITLE = "Portfolio";
const FALLBACK_DESCRIPTION = "Portfolio website.";

export default function Seo({ title, description, path = "/" }) {
  const { profile } = useProfile();
  const siteName = profile?.name || FALLBACK_TITLE;
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — ${profile?.role || "Portfolio"}`;
  const desc = description || profile?.tagline || FALLBACK_DESCRIPTION;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
