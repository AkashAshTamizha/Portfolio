import { motion } from "framer-motion";
import Reveal from "../ui/Reveal";
import {
  FiCode, FiServer, FiLayout, FiDatabase, FiActivity, FiSend,
} from "react-icons/fi";

const iconMap = {
  Code2: FiCode,
  Server: FiServer,
  LayoutTemplate: FiLayout,
  Database: FiDatabase,
  Gauge: FiActivity,
  Rocket: FiSend,
};

export default function ServiceCard({ service, delay = 0 }) {
  const Icon = iconMap[service.icon] || FiCode;
  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -4 }}
        className="card-surface p-6 h-full hover:border-blue-400/30 hover:shadow-glow"
      >
        <div className="h-11 w-11 rounded-lg bg-brand-gradient flex items-center justify-center text-white mb-4 shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold font-display">{service.title}</h3>
        <p className="mt-2 text-sm text-cloud-500 leading-relaxed">{service.description}</p>
      </motion.div>
    </Reveal>
  );
}
