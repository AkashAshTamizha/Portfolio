import { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "./context/ThemeContext";
import { ProfileProvider } from "./context/ProfileContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import GlobalSettingsStyle from "./components/layout/GlobalSettingsStyle";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageTransition from "./components/layout/PageTransition";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Loader from "./components/ui/Loader";
import BackToTop from "./components/ui/BackToTop";
import { UserAuthProvider } from "./context/UserAuthContext";

// Route-level code splitting: each page becomes its own chunk and is only
// downloaded when the user actually navigates to it. This is what keeps the
// initial bundle small and first-load fast, instead of shipping all pages
// (and, below, the entire Admin/Employee dashboards) up front.
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Skills = lazy(() => import("./pages/Skills"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Experience = lazy(() => import("./pages/Experience"));
const Education = lazy(() => import("./pages/Education"));
const Certifications = lazy(() => import("./pages/Certifications"));
const Resume = lazy(() => import("./pages/Resume"));
const Contact = lazy(() => import("./pages/Contact"));
const Team = lazy(() => import("./pages/Team"));
const TeamMemberDetail = lazy(() => import("./pages/TeamMemberDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Logout = lazy(() => import("./pages/Logout"));
const MyReviews = lazy(() => import("./pages/MyReviews"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Previously these were eager (non-lazy) imports at the top of this file,
// which meant the entire admin dashboard and employee portal — forms,
// charts, rich text editors, the lot — were bundled into the one JS file
// every single visitor downloads before the public site can even paint,
// even though ~99% of visitors never go near /admin or /employee. That
// inflated the main bundle to 600KB+ or a slow connection, the loading
// screen fades out, and then the (still-downloading/parsing) page pops in
// a beat late — which reads as the page "flashing" or "blinking" in. Lazy
// loading these two keeps them out of the initial bundle entirely.
const AdminRoutes = lazy(() => import("./admin/AdminRoutes"));
const EmployeeRoutes = lazy(() => import("./employee/EmployeeRoutes"));

// Lightweight, non-flashy fallback for the brief moment a lazy chunk loads.
// Deliberately minimal (no animation) so route-to-route navigation doesn't
// introduce a second "flash" on top of the page transition itself.
function RouteFallback() {
  return <div className="min-h-[40vh]" aria-hidden="true" />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Suspense fallback={<RouteFallback />}><Home /></Suspense></PageTransition>} />
        <Route path="/about" element={<PageTransition><Suspense fallback={<RouteFallback />}><About /></Suspense></PageTransition>} />
        <Route path="/skills" element={<PageTransition><Suspense fallback={<RouteFallback />}><Skills /></Suspense></PageTransition>} />
        <Route path="/services" element={<PageTransition><Suspense fallback={<RouteFallback />}><Services /></Suspense></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Suspense fallback={<RouteFallback />}><Projects /></Suspense></PageTransition>} />
        <Route path="/projects/:id" element={<PageTransition><Suspense fallback={<RouteFallback />}><ProjectDetail /></Suspense></PageTransition>} />
        <Route path="/experience" element={<PageTransition><Suspense fallback={<RouteFallback />}><Experience /></Suspense></PageTransition>} />
        <Route path="/education" element={<PageTransition><Suspense fallback={<RouteFallback />}><Education /></Suspense></PageTransition>} />
        <Route path="/certifications" element={<PageTransition><Suspense fallback={<RouteFallback />}><Certifications /></Suspense></PageTransition>} />
        <Route path="/resume" element={<PageTransition><Suspense fallback={<RouteFallback />}><Resume /></Suspense></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Suspense fallback={<RouteFallback />}><Contact /></Suspense></PageTransition>} />
        <Route path="/team" element={<PageTransition><Suspense fallback={<RouteFallback />}><Team /></Suspense></PageTransition>} />
        <Route path="/team/:id" element={<PageTransition><Suspense fallback={<RouteFallback />}><TeamMemberDetail /></Suspense></PageTransition>} />
        <Route path="/login" element={<PageTransition><Suspense fallback={<RouteFallback />}><Login /></Suspense></PageTransition>} />
        <Route path="/register" element={<PageTransition><Suspense fallback={<RouteFallback />}><Register /></Suspense></PageTransition>} />
        <Route path="/logout" element={<PageTransition><Suspense fallback={<RouteFallback />}><Logout /></Suspense></PageTransition>} />
        <Route
          path="/my-reviews"
          element={
            <PageTransition>
              <Suspense fallback={<RouteFallback />}>
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              </Suspense>
            </PageTransition>
          }
        />
        <Route path="*" element={<PageTransition><Suspense fallback={<RouteFallback />}><NotFound /></Suspense></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// The admin dashboard is a self-contained app (its own auth, layout, and
// dark theme) and deliberately skips the public site's Navbar/Footer/loader.
function AdminShell() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <AdminRoutes />
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#121A2E", color: "#E7E9F5", border: "1px solid #232A54", fontSize: "14px" },
        }}
      />
    </>
  );
}

// The employee portal is likewise self-contained, mirroring AdminShell.
function EmployeeShell() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <EmployeeRoutes />
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#121A2E", color: "#E7E9F5", border: "1px solid #232A54", fontSize: "14px" },
        }}
      />
    </>
  );
}

function PublicShell() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <ProfileProvider>
        <SiteSettingsProvider>
          <UserAuthProvider>
            <GlobalSettingsStyle />
            <AnimatePresence>{loading && <Loader />}</AnimatePresence>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1">
                <AnimatedRoutes />
              </div>
              <Footer />
            </div>
            <BackToTop />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#111530",
                  color: "#E7E9F5",
                  border: "1px solid #232A54",
                  fontSize: "14px",
                },
              }}
            />
          </UserAuthProvider>
        </SiteSettingsProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isEmployee = location.pathname.startsWith("/employee");

  return (
    <HelmetProvider>
      {isAdmin ? <AdminShell /> : isEmployee ? <EmployeeShell /> : <PublicShell />}
      <Analytics />
    </HelmetProvider>
  );
}
