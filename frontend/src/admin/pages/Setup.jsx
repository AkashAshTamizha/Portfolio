import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuUser, LuMail, LuLock, LuEye, LuEyeOff } from "react-icons/lu";
import { api, setToken } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Setup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checking, setChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Ask the backend whether an admin already exists. If one does, this page
  // has nothing to do — redirect straight to login rather than show a form
  // that will only ever 403.
  useEffect(() => {
    api
      .get("/auth/setup-status")
      .then((res) => setSetupRequired(!!res.data?.setupRequired))
      .catch(() => setSetupRequired(false))
      .finally(() => setChecking(false));
  }, []);

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/setup", { name: name.trim(), email: email.trim(), password });
      setToken(res.token);
      toast.success("Admin account created. Welcome!");
      navigate("/admin/dashboard", { replace: true });
      window.location.reload(); // refresh AuthContext with the new token, same as ResetPassword
    } catch (err) {
      if (err.status === 403) {
        // Someone else finished setup in the meantime — send them to login.
        toast.error(err.message);
        setSetupRequired(false);
      } else if (err.errors?.length) {
        const fieldErrors = {};
        err.errors.forEach((e2) => {
          if (e2.path) fieldErrors[e2.path] = e2.msg;
        });
        setErrors(fieldErrors);
        toast.error(err.message || "Please fix the errors below.");
      } else {
        toast.error(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Already logged in? Nothing to set up.
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!setupRequired) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-grid px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-2xl font-semibold text-cloud-100">Create admin account</p>
          <p className="text-sm text-cloud-400 mt-1">
            No admin exists yet — set one up to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cloud-300 mb-1.5">
              Name
            </label>
            <div className="relative">
              <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.name ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-coral-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cloud-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-coral-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cloud-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-10 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cloud-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-coral-400">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cloud-300 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.confirmPassword ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="Repeat password"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-coral-400">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create admin account"}
          </button>
        </form>

        <p className="text-center text-xs text-cloud-500 mt-6">
          Already set up?{" "}
          <Link to="/admin/login" className="hover:underline">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}
