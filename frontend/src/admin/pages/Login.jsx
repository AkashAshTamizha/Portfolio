import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuLock, LuMail, LuEye, LuEyeOff } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // No admin exists yet on this install — send people straight to the
  // one-time setup form instead of a login page that can never succeed.
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    api
      .get("/auth/setup-status")
      .then((res) => setSetupRequired(!!res.data?.setupRequired))
      .catch(() => setSetupRequired(false));
  }, []);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || "/admin/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (setupRequired) {
    return <Navigate to="/admin/setup" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-grid bg-grid px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-2xl font-semibold text-cloud-100">Portfolio Admin</p>
          <p className="text-sm text-cloud-400 mt-1">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-10 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="••••••••"
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

          <div className="flex justify-end -mt-2">
            <Link to="/admin/forgot-password" className="text-xs text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-cloud-500 mt-6">
          <Link to="/" className="hover:underline">
            ← Back to portfolio site
          </Link>
        </p>
      </div>
    </div>
  );
}
