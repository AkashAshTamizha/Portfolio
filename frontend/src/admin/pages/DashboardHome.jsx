import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuSparkles,
  LuBriefcase,
  LuGraduationCap,
  LuAward,
  LuFolderKanban,
  LuMail,
  LuUsers,
  LuListChecks,
  LuStar,
  LuCalendarClock,
} from "react-icons/lu";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const STAT_CARDS = [
  { key: "skills", label: "Skills", icon: LuSparkles, path: "/skills", to: "/admin/skills" },
  { key: "services", label: "Services", icon: LuBriefcase, path: "/services", to: "/admin/services" },
  { key: "experience", label: "Experience", icon: LuBriefcase, path: "/experience", to: "/admin/experience" },
  { key: "education", label: "Education", icon: LuGraduationCap, path: "/education", to: "/admin/education" },
  { key: "certifications", label: "Certifications", icon: LuAward, path: "/certifications", to: "/admin/certifications" },
  { key: "projects", label: "Projects", icon: LuFolderKanban, path: "/projects", to: "/admin/projects" },
];

const PIE_COLORS = ["#5B8DEF", "#8B7CF6", "#34D399", "#F87171"];

export default function DashboardHome() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const [pmStats, setPmStats] = useState(null);
  const [projectStatus, setProjectStatus] = useState([]);
  const [employeePerf, setEmployeePerf] = useState([]);
  const [monthlyReviews, setMonthlyReviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all(
      STAT_CARDS.map((c) =>
        api
          .get(`${c.path}?limit=1`)
          .then((res) => [c.key, res.total ?? res.count ?? 0])
          .catch(() => [c.key, "—"])
      )
    ).then((results) => {
      if (!mounted) return;
      setCounts(Object.fromEntries(results));
      setLoading(false);
    });

    Promise.all([
      api.get("/admin/stats").catch(() => null),
      api.get("/admin/stats/projects-by-status").catch(() => null),
      api.get("/admin/stats/employee-performance").catch(() => null),
      api.get("/admin/stats/reviews-monthly").catch(() => null),
    ]).then(([overview, byStatus, perf, monthly]) => {
      if (!mounted) return;
      if (overview) setPmStats(overview.data);
      if (byStatus) setProjectStatus(byStatus.data || []);
      if (perf) setEmployeePerf(perf.data || []);
      if (monthly) setMonthlyReviews(monthly.data || []);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-cloud-100">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-cloud-400 mt-1">Here&apos;s a quick overview of your portfolio content.</p>
      </div>

      {pmStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Employees", value: pmStats.totalEmployees, icon: LuUsers },
            { label: "Total Projects", value: pmStats.totalProjects, icon: LuFolderKanban },
            { label: "Total Tasks", value: pmStats.totalTasks, icon: LuListChecks },
            { label: "Completed Projects", value: pmStats.completedProjects, icon: LuFolderKanban },
            { label: "Active Projects", value: pmStats.activeProjects, icon: LuFolderKanban },
            { label: "Pending Tasks", value: pmStats.pendingTasks, icon: LuListChecks },
            { label: "Pending Leave Requests", value: pmStats.pendingLeaves, icon: LuCalendarClock },
            { label: "Average Rating", value: pmStats.averageRating, icon: LuStar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-surface p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-cloud-100">{value}</p>
                <p className="text-xs text-cloud-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, to }) => (
          <Link key={key} to={to} className="card-surface p-5 flex items-center gap-4 hover:border-blue-400/50 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold text-cloud-100">{loading ? "…" : counts[key]}</p>
              <p className="text-sm text-cloud-400">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {(projectStatus.length > 0 || employeePerf.length > 0 || monthlyReviews.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {projectStatus.length > 0 && (
            <div className="card-surface p-5">
              <h3 className="font-display text-sm font-semibold text-cloud-100 mb-4">Project Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={projectStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80}>
                    {projectStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#121A2E", border: "1px solid #232A54", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {employeePerf.length > 0 && (
            <div className="card-surface p-5">
              <h3 className="font-display text-sm font-semibold text-cloud-100 mb-4">Employee Performance (avg rating)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={employeePerf}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8891B5" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#8891B5" }} />
                  <Tooltip contentStyle={{ background: "#121A2E", border: "1px solid #232A54", borderRadius: 8 }} />
                  <Bar dataKey="avgRating" fill="#5B8DEF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {monthlyReviews.length > 0 && (
            <div className="card-surface p-5 lg:col-span-2">
              <h3 className="font-display text-sm font-semibold text-cloud-100 mb-4">Monthly Reviews</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyReviews}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8891B5" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8891B5" }} />
                  <Tooltip contentStyle={{ background: "#121A2E", border: "1px solid #232A54", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="#8B7CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 card-surface p-5">
        <div className="flex items-center gap-3 mb-1">
          <LuMail className="h-5 w-5 text-blue-400" />
          <h2 className="font-display text-lg font-semibold text-cloud-100">Quick links</h2>
        </div>
        <p className="text-sm text-cloud-400 mb-4">Manage the rest of your site content.</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/profile" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Profile
          </Link>
          <Link to="/admin/contact-info" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Contact Info
          </Link>
          <Link to="/admin/employees" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Employees
          </Link>
          <Link to="/admin/tasks" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Tasks
          </Link>
          <Link to="/admin/attendance" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Attendance
          </Link>
          <Link to="/admin/leaves" className="rounded-xl border border-ink-600 px-3.5 py-2 text-sm text-cloud-300 hover:bg-ink-700">
            Leave Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
