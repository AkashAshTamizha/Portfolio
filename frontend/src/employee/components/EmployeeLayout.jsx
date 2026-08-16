import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUser,
  LuSparkles,
  LuGraduationCap,
  LuAward,
  LuMail,
  LuListChecks,
  LuFolderKanban,
  LuClock,
  LuCalendarClock,
  LuMenu,
  LuX,
  LuLogOut,
  LuExternalLink,
} from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/employee/dashboard", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/employee/profile", label: "Profile", icon: LuUser },
  { to: "/employee/skills", label: "Skills", icon: LuSparkles },
  { to: "/employee/education", label: "Education", icon: LuGraduationCap },
  { to: "/employee/certifications", label: "Certifications", icon: LuAward },
  { to: "/employee/contact-info", label: "Contact Information", icon: LuMail },
  { to: "/employee/tasks", label: "Tasks", icon: LuListChecks },
  { to: "/employee/attendance", label: "Attendance", icon: LuClock },
  { to: "/employee/leave", label: "Leave", icon: LuCalendarClock },
  { to: "/employee/projects", label: "My Projects", icon: LuFolderKanban },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/employee/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6 border-b border-ink-700">
        <p className="font-display text-lg font-semibold text-cloud-100">Employee Portal</p>
        <p className="text-xs text-cloud-500 mt-1 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "text-cloud-300 hover:bg-ink-700 hover:text-cloud-100"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-ink-700 space-y-1">
        <a
          href="/team"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cloud-300 hover:bg-ink-700 hover:text-cloud-100"
        >
          <LuExternalLink className="h-4.5 w-4.5" />
          View public profile
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-coral-400 hover:bg-coral-500/10"
        >
          <LuLogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function EmployeeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-950 text-cloud-100 font-body">
      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-ink-700 bg-ink-900 sticky top-0 h-screen">
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <aside className="absolute left-0 top-0 h-full w-72 bg-ink-900 border-r border-ink-700">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-700 bg-ink-900/80 backdrop-blur px-4 sm:px-6 py-3.5">
            <button
              className="lg:hidden p-2 rounded-lg text-cloud-300 hover:bg-ink-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <LuMenu className="h-5 w-5" />
            </button>
            <p className="font-display text-sm text-cloud-300 lg:hidden">Employee Portal</p>
            <div className="hidden lg:block" />
            <button className="lg:hidden p-2 rounded-lg opacity-0 pointer-events-none" aria-hidden="true">
              <LuX className="h-5 w-5" />
            </button>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
