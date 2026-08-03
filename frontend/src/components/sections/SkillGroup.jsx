import { motion } from "framer-motion";
import Reveal from "../ui/Reveal";
import { getSkillIcon } from "../../utils/skillIcons";

export default function SkillGroup({ group, delay = 0 }) {
  return (
    <Reveal delay={delay} className="card-surface p-6">
      <h3 className="text-sm font-semibold text-cloud-300 [html.light_&]:text-cloud-700 mb-5">{group.category}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {group.items.map((skill, i) => {
          const { Icon, color } = getSkillIcon(skill.name);
          return (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-900 px-3 py-4 text-center transition-colors hover:border-blue-400/40"
              title={`${skill.name} — level ${skill.level}/5`}
            >
              <Icon className="h-7 w-7" style={{ color }} />
              <span className="text-[11px] leading-tight text-cloud-300 [html.light_&]:text-cloud-700">
                {skill.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Reveal>
  );
}
