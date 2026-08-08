import { Link } from "react-router-dom";
import { navLinks } from "../../data/navLinks";
import { useProfile } from "../../hooks/useProfile";
import { useApiData } from "../../hooks/useApiData";
import { getServices } from "../../utils/api";
import SocialLinks from "../ui/SocialLinks";

export default function Footer() {
  const year = new Date().getFullYear();
  const { profile } = useProfile();
  const { data: services } = useApiData(getServices, []);
  const serviceList = services || [];

  const initials = profile?.initials || (profile?.name ? profile.name.slice(0, 2).toUpperCase() : "");

  return (
    <footer className="border-t border-ink-800 [html.light_&]:border-paper-300 bg-ink-950 [html.light_&]:bg-paper-50">
      <div className="container-content px-6 sm:px-10 lg:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-mono text-sm font-semibold">
            <span className="text-cloud-500">{"{"}</span>
            <span className="text-cloud-100 [html.light_&]:text-cloud-900">{initials || "··"}</span>
            <span className="text-cloud-500">{"}"}</span>
          </Link>
          <p className="mt-4 text-sm text-cloud-500 leading-relaxed max-w-xs">
            {profile?.role
              ? `${profile.role} passionate about building performant, accessible digital experiences.`
              : "Portfolio site."}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono tracking-wide text-cloud-100 [html.light_&]:text-cloud-900 mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            {navLinks.slice(0, 6).map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm text-cloud-500 hover:text-blue-400 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono tracking-wide text-cloud-100 [html.light_&]:text-cloud-900 mb-4">
            Services
          </h4>
          {serviceList.length > 0 ? (
            <ul className="space-y-2.5">
              {serviceList.slice(0, 5).map((s) => (
                <li key={s._id} className="text-sm text-cloud-500">
                  {s.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cloud-600">No data available.</p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-mono tracking-wide text-cloud-100 [html.light_&]:text-cloud-900 mb-4">
            Follow Me
          </h4>
          <SocialLinks />
          {profile?.email && <p className="mt-6 text-sm text-cloud-500">{profile.email}</p>}
        </div>
      </div>

      <div className="border-t border-ink-800 [html.light_&]:border-paper-300">
        <div className="container-content px-6 sm:px-10 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cloud-500">
            © {year} {profile?.name || "Portfolio"}. All rights reserved.
          </p>
          <p className="text-xs font-mono text-cloud-500">
            Built with <span className="text-blue-400">React</span> &amp;{" "}
            <span className="text-violet-400">Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}


