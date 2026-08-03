import { motion } from "framer-motion";
import { FaReact, FaNodeJs } from "react-icons/fa";
import { SiJavascript } from "react-icons/si";
import { useProfile } from "../../hooks/useProfile";
import { assetUrl } from "../../utils/api";

export default function HeroPhoto() {
  const { profile } = useProfile();
  const avatar = assetUrl(profile?.avatar);
  const initials = profile?.initials || (profile?.name ? profile.name.slice(0, 2).toUpperCase() : "");

  return (
    <div className="relative settings-profile shrink-0">
      {/* Dot grid decoration, top-right */}
      <div className="absolute -top-4 right-4 grid grid-cols-4 gap-1.5 opacity-70">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />
        ))}
      </div>

      {/* Circular gradient backdrop */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute inset-4 sm:inset-6 settings-profile-mask bg-brand-gradient shadow-glow"
      />

      {/* Profile image */}
      <div className="absolute inset-4 sm:inset-6 settings-profile-mask overflow-hidden border-4 border-ink-950 [html.light_&]:border-paper-50 flex items-end justify-center">
        {avatar ? (
          <img
            src={avatar}
            alt={profile?.name || "Profile"}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 items-center justify-center font-display text-6xl sm:text-7xl font-bold text-white/90"
          style={{ display: avatar ? "none" : "flex" }}
        >
          {initials || "?"}
        </div>
      </div>

      {/* Floating tech badges (decorative, not content) */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 right-0 h-14 w-14 rounded-2xl bg-ink-800 border border-ink-600 shadow-card flex items-center justify-center"
      >
        <FaReact className="h-7 w-7 text-[#61DAFB]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute top-1/3 -left-4 h-12 w-12 rounded-xl bg-[#F7DF1E] shadow-card flex items-center justify-center"
      >
        <SiJavascript className="h-6 w-6 text-ink-950" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-4 right-2 h-14 w-14 rounded-2xl bg-ink-800 border border-ink-600 shadow-card flex items-center justify-center"
      >
        <FaNodeJs className="h-7 w-7 text-[#68A063]" />
      </motion.div>
    </div>
  );
}
