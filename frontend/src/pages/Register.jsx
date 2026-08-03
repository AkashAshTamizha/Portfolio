import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiLock, FiMail } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import { useUserAuth } from "../hooks/useUserAuth";

export default function Register() {
  const { register } = useUserAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success("Account created!");
      navigate("/team", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Register" path="/register" />
      <div className="section-pad flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold font-display text-center mb-2">Create an account</h1>
          <p className="text-sm text-cloud-500 text-center mb-6">Rate and review employees & projects.</p>
          <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Jane Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cloud-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl bg-ink-900 border border-ink-600 pl-10 pr-3.5 py-2.5 text-sm text-cloud-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm text-cloud-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
