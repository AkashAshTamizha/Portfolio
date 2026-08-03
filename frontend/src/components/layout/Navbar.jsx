import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiUser, FiLogOut, FiStar, FiChevronDown } from "react-icons/fi";
import { navLinks } from "../../data/navLinks";
import { useProfile } from "../../hooks/useProfile";
import { useUserAuth } from "../../hooks/useUserAuth";
import { assetUrl } from "../../utils/api";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { user, isAuthenticated, logout } = useUserAuth();
  const brand = profile?.name ? profile.name.split(" ")[0] : "Portfolio";
  const resumeUrl = assetUrl(profile?.resumeUrl);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 glass-panel border-b transition-shadow duration-300 ${
        scrolled ? "shadow-glass" : ""
      }`}
    >
      <nav className="container-content flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16">
        <Link to="/" className="font-mono text-sm font-semibold tracking-tight shrink-0">
          <span className="text-cloud-500">{"{"}</span>
          <span className="text-gradient">{brand}</span>
          <span className="text-cloud-500">{"}"}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                  isActive
                    ? "text-white [html.light_&]:text-cloud-900"
                    : "text-cloud-300 hover:text-cloud-100 [html.light_&]:text-cloud-700 [html.light_&]:hover:text-cloud-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-brand-gradient"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {resumeUrl && (
            <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" className="btn-primary !py-2.5">
              Download CV
            </a>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-lg border border-ink-600 [html.light_&]:border-paper-300 bg-ink-800 [html.light_&]:bg-white px-3 py-2 text-sm font-medium text-cloud-200 [html.light_&]:text-cloud-800 hover:border-blue-400/60"
              >
                <span className="h-6 w-6 rounded-full bg-blue-400/15 text-blue-400 flex items-center justify-center text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </span>
                {user?.name?.split(" ")[0] || "Account"}
                <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-ink-700 [html.light_&]:border-paper-300 bg-ink-900 [html.light_&]:bg-white shadow-card overflow-hidden z-50"
                  >
                    <Link
                      to="/my-reviews"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-cloud-300 [html.light_&]:text-cloud-700 hover:bg-ink-800 [html.light_&]:hover:bg-paper-100"
                    >
                      <FiStar className="h-4 w-4" /> My Reviews
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-coral-400 hover:bg-ink-800 [html.light_&]:hover:bg-paper-100"
                    >
                      <FiLogOut className="h-4 w-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary !py-2.5">
                <FiUser className="h-4 w-4" /> Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2.5">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/10 [html.light_&]:border-paper-300 text-cloud-100 [html.light_&]:text-cloud-900"
          >
            {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-white/10 [html.light_&]:border-paper-300 glass-panel"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm rounded-md font-medium transition-colors ${
                      isActive
                        ? "text-blue-400 bg-blue-400/10"
                        : "text-cloud-500 hover:text-cloud-100 [html.light_&]:hover:text-cloud-900"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {resumeUrl && (
                <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" className="btn-primary justify-center mt-3">
                  Download CV
                </a>
              )}

              <div className="mt-3 pt-3 border-t border-white/10 [html.light_&]:border-paper-300 flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/my-reviews"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md font-medium text-cloud-300 hover:text-cloud-100"
                    >
                      <FiStar className="h-4 w-4" /> My Reviews ({user?.name})
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md font-medium text-coral-400"
                    >
                      <FiLogOut className="h-4 w-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md font-medium text-cloud-300 hover:text-cloud-100"
                    >
                      <FiUser className="h-4 w-4" /> Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 text-sm rounded-md font-medium text-blue-400"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
