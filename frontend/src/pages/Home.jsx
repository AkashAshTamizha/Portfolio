import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import HeroPhoto from "../components/sections/HeroPhoto";
import SocialLinks from "../components/ui/SocialLinks";
import EmptyState from "../components/ui/EmptyState";
import { useProfile } from "../hooks/useProfile";

export default function Home() {
  const { profile, loading, hasProfile } = useProfile();

  return (
    <>
      <Seo path="/" />

      {/* Hero — text left, circular photo right, scroll indicator. */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="container-content px-6 sm:px-10 lg:px-16 py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center relative w-full">
          {!loading && !hasProfile ? (
            <div className="lg:col-span-2">
              <EmptyState message="No data available. Add your profile from the admin panel to populate this page." />
            </div>
          ) : (
            <>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
                >
                  Hi, I&apos;m <span className="text-gradient">{profile?.name?.split(" ")[0] || ""}</span> 👋
                </motion.h1>
                {profile?.role && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="mt-2 text-2xl sm:text-3xl font-semibold text-gradient"
                  >
                    {profile.role}
                  </motion.p>
                )}
                {profile?.tagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.16 }}
                    className="mt-6 text-cloud-500 text-lg leading-relaxed max-w-lg"
                  >
                    {profile.tagline}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.22 }}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <Link to="/contact" className="btn-primary">
                    Hire Me <FiArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/projects" className="btn-secondary">
                    View Projects
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.3 }}
                  className="mt-10"
                >
                  <SocialLinks />
                </motion.div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <HeroPhoto />
              </div>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="hidden lg:flex absolute left-16 bottom-8 flex-col items-center gap-2 text-cloud-500"
        >
          <span className="font-mono text-[11px] tracking-wide">Scroll Down</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-blue-400"
          >
            ↓
          </motion.span>
        </motion.div>
      </section>
    </>
  );
}
