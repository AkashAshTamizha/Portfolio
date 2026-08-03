import {
  SiJavascript, SiTypescript, SiPython, SiOpenjdk,
  SiReact, SiRedux, SiTailwindcss, SiNextdotjs, SiHtml5, SiCss,
  SiNodedotjs, SiExpress, SiGraphql, SiSocketdotio,
  SiMongodb, SiMysql, SiPostgresql, SiRedis,
  SiDocker, SiGithubactions, SiVercel, SiNginx,
  SiGit, SiGithub, SiPostman, SiFigma, SiJest, SiLinux,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { FiServer, FiTerminal, FiCode } from "react-icons/fi";

// Ordered so more specific matches (e.g. "javascript") are checked before
// broader ones (e.g. "java") since matching is substring-based.
const ICON_RULES = [
  ["typescript", SiTypescript, "#3178C6"],
  ["javascript", SiJavascript, "#F7DF1E"],
  ["python", SiPython, "#3776AB"],
  ["java", SiOpenjdk, "#EA2D2E"],
  ["react", SiReact, "#61DAFB"],
  ["redux", SiRedux, "#764ABC"],
  ["tailwind", SiTailwindcss, "#38BDF8"],
  ["next.js", SiNextdotjs, "#FFFFFF"],
  ["html5", SiHtml5, "#E34F26"],
  ["css3", SiCss, "#1572B6"],
  ["node", SiNodedotjs, "#3C873A"],
  ["express", SiExpress, "#FFFFFF"],
  ["rest api", FiServer, "#60A5FA"],
  ["graphql", SiGraphql, "#E10098"],
  ["socket.io", SiSocketdotio, "#FFFFFF"],
  ["mongodb", SiMongodb, "#47A248"],
  ["mysql", SiMysql, "#4479A1"],
  ["postgresql", SiPostgresql, "#4169E1"],
  ["redis", SiRedis, "#DC382D"],
  ["aws", FaAws, "#FF9900"],
  ["docker", SiDocker, "#2496ED"],
  ["github actions", SiGithubactions, "#2088FF"],
  ["vercel", SiVercel, "#FFFFFF"],
  ["render", FiServer, "#60A5FA"],
  ["nginx", SiNginx, "#009639"],
  ["github", SiGithub, "#FFFFFF"],
  ["git", SiGit, "#F05032"],
  ["postman", SiPostman, "#FF6C37"],
  ["figma", SiFigma, "#A259FF"],
  ["jest", SiJest, "#C21325"],
  ["testing library", SiJest, "#C21325"],
  ["linux", SiLinux, "#FCC624"],
  ["bash", FiTerminal, "#8A8FB8"],
];

export function getSkillIcon(name) {
  const lower = name.toLowerCase();
  const match = ICON_RULES.find(([key]) => lower.includes(key));
  return match ? { Icon: match[1], color: match[2] } : { Icon: FiCode, color: "#8B5CF6" };
}
