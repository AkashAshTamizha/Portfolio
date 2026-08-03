import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuListChecks, LuFolderKanban, LuStar, LuMessageSquare, LuClock, LuCalendarClock } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="card-surface p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-cloud-100">{value}</p>
        <p className="text-xs text-cloud-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { employee, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data || []))
      .finally(() => setLoading(false));
    api.get("/attendance/today").then((res) => setTodayAttendance(res.data));
    api.get("/leaves").then((res) => setLeaves(res.data || []));
  }, []);

  const pending = tasks.filter((t) => t.status !== "completed").length;
  const completed = tasks.length - pending;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const attendanceLabel = !todayAttendance?.punchIn
    ? "Not punched in"
    : !todayAttendance?.punchOut
    ? "Punched in"
    : "Day complete";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold font-display">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-cloud-500 mt-1">Here&apos;s a quick look at your profile and work.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={LuClock} label="Today's Attendance" value={attendanceLabel} />
        <StatTile icon={LuListChecks} label="Pending Tasks" value={loading ? "–" : pending} />
        <StatTile icon={LuListChecks} label="Completed Tasks" value={loading ? "–" : completed} />
        <StatTile icon={LuCalendarClock} label="Leave Status" value={pendingLeaves > 0 ? `${pendingLeaves} pending` : "Up to date"} />
        <StatTile icon={LuFolderKanban} label="Total Projects" value={employee?.stats?.totalProjects ?? 0} />
        <StatTile icon={LuStar} label="Average Rating" value={(employee?.stats?.avgRating ?? 0).toFixed(1)} />
        <StatTile icon={LuMessageSquare} label="Reviews" value={employee?.stats?.reviewCount ?? 0} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/employee/attendance" className="card-surface p-5 hover:border-blue-400/50 transition-colors block">
          <p className="font-semibold text-cloud-100">
            {!todayAttendance?.punchIn ? "Punch in for today" : !todayAttendance?.punchOut ? "Punch out when you're done" : "You're all set for today"}
          </p>
          <p className="text-sm text-cloud-500 mt-1">Track your daily attendance.</p>
        </Link>
        <Link to="/employee/tasks" className="card-surface p-5 hover:border-blue-400/50 transition-colors block">
          <p className="font-semibold text-cloud-100">Update your task progress</p>
          <p className="text-sm text-cloud-500 mt-1">{pending} task(s) still in progress or to do.</p>
        </Link>
        <Link to="/employee/leave" className="card-surface p-5 hover:border-blue-400/50 transition-colors block">
          <p className="font-semibold text-cloud-100">Need time off?</p>
          <p className="text-sm text-cloud-500 mt-1">Apply for leave or check your request status.</p>
        </Link>
        <Link to="/employee/profile" className="card-surface p-5 hover:border-blue-400/50 transition-colors block">
          <p className="font-semibold text-cloud-100">Keep your profile fresh</p>
          <p className="text-sm text-cloud-500 mt-1">Update your bio, skills, and resume.</p>
        </Link>
      </div>
    </div>
  );
}
