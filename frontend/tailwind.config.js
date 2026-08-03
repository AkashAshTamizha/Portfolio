/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme (default) — deep navy surfaces with a blue/purple tint
        ink: {
          950: "#090E1B",
          900: "#0D1220",
          800: "#121A2E",
          700: "#1B2338",
          600: "#2A3352",
        },
        // Light theme surfaces
        paper: {
          50: "#F7F8FC",
          100: "#FFFFFF",
          200: "#ECEEF7",
          300: "#DCE0F0",
        },
        // Text
        cloud: {
          100: "#E7E9F5",
          300: "#B6BBDA",
          500: "#8A8FB8",
          700: "#525A85",
          900: "#1A1D30",
        },
        coral: {
          400: "#FF8A8A",
          500: "#FF6B6B",
          600: "#E23F3F",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,0.2), 0 8px 30px -6px rgba(124,58,237,0.45)",
        card: "0 4px 24px -6px rgba(0,0,0,0.45)",
        glass: "0 8px 32px 0 rgba(10,13,28,0.37)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(139,147,167,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,147,167,0.08) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(135deg, #3452ED 0%, #6C5CE7 55%, #8B5CF6 100%)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      keyframes: {
        blink: { "0%,49%": { opacity: 1 }, "50%,100%": { opacity: 0 } },
        floatY: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 0.8, transform: "scale(1.06)" },
        },
        bounceDown: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        floatY: "floatY 5s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        bounceDown: "bounceDown 1.6s ease-in-out infinite",
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [],
};
