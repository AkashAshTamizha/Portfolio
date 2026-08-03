import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LuLock } from "react-icons/lu";
import { api, setToken } from "../api/client";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
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
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setToken(res.token);
      toast.success("Password reset. You're logged in.");
      navigate("/admin/dashboard", { replace: true });
      window.location.reload(); // refresh AuthContext with the new token
    } catch (err) {
      toast.error(err.message || "Reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-grid px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-2xl font-semibold text-cloud-100">Reset password</p>
          <p className="text-sm text-cloud-400 mt-1">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cloud-300 mb-1.5">
              New password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl bg-ink-900 border pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-coral-500" : "border-ink-600"
                }`}
                placeholder="At least 8 characters"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-coral-400">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cloud-300 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
              <input
                id="confirmPassword"
                type="password"
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
            {loading ? "Resetting…" : "Reset password"}
          </button>
          <p className="text-center text-xs text-cloud-500">
            <Link to="/admin/login" className="hover:underline">
              ← Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
