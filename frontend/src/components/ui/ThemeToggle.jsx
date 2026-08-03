import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 text-cloud-300 hover:text-blue-400 hover:border-blue-400 transition-colors duration-200 ${className}`}
    >
      <FiSun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
      <FiMoon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
    </button>
  );
}
