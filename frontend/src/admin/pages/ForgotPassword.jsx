import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuMail } from "react-icons/lu";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      toast.success(res.message);
      setSent(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-grid px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-2xl font-semibold text-cloud-100">Forgot password</p>
          <p className="text-sm text-cloud-400 mt-1">We&apos;ll email you a reset link</p>
        </div>

        <div className="card-surface p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-cloud-300">
                If an account exists for <span className="text-cloud-100">{email}</span>, a password reset link is
                on its way. Check your inbox (and spam folder).
              </p>
              <Link to="/admin/login" className="inline-block text-sm text-blue-400 hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cloud-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-ink-900 border border-ink-600 pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <p className="text-center text-xs text-cloud-500">
                <Link to="/admin/login" className="hover:underline">
                  ← Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
