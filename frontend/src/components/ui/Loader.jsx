import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950 [html.light_&]:bg-paper-50"
    >
      <div className="font-mono text-lg sm:text-xl flex items-center gap-1">
        <span className="text-cloud-500">const</span>
        <span className="text-cloud-100 [html.light_&]:text-cloud-900 ml-1">portfolio</span>
        <span className="text-cloud-500">=</span>
        <motion.span
          className="text-blue-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          loading()
        </motion.span>
        <span className="text-cloud-500 animate-blink">_</span>
      </div>
    </motion.div>
  );
}
