import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import Reveal from "../ui/Reveal";
import { assetUrl } from "../../utils/api";

function ProjectCard({ project, delay = 0 }) {
  const image = assetUrl(project.image);

  return (
    <Reveal delay={delay}>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="card-surface settings-card overflow-hidden group h-full flex flex-col"
      >
        <Link to={`/projects/${project._id}`} className="relative overflow-hidden bg-ink-800 [html.light_&]:bg-paper-200 block">
          {image && (
            <img
              src={image}
              alt={`${project.name} preview`}
              loading="lazy"
              className="settings-image transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {project.category && <div className="absolute top-3 left-3 tag-chip">{project.category}</div>}
        </Link>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/projects/${project._id}`}>
              <h3 className="text-lg font-semibold font-display hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
            </Link>
            {project.year && <span className="font-mono text-xs text-cloud-500 shrink-0">{project.year}</span>}
          </div>
          <p className="mt-2 text-sm text-cloud-500 leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {project.tech?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.slice(0, 4).map((t) => (
                <span key={t} className="tag-chip">{t}</span>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 pt-4 border-t border-ink-800 [html.light_&]:border-paper-300">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-cloud-300 hover:text-blue-400 transition-colors"
              >
                <FiGithub className="h-4 w-4" /> Code
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-cloud-300 hover:text-blue-400 transition-colors"
              >
                <FiExternalLink className="h-4 w-4" /> Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export default memo(ProjectCard);
