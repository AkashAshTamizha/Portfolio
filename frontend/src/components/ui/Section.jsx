import { motion } from "framer-motion";

/**
 * Consistent section shell: eyebrow (styled like a code comment),
 * heading, optional subtext, scroll-reveal animation.
 */
export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  align = "left",
}) {
  return (
    <section id={id} className={`section-pad ${className}`}>
      <div className="container-content">
        {(eyebrow || title) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`mb-12 ${align === "center" ? "text-center mx-auto max-w-2xl" : ""}`}
          >
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-4 text-cloud-500 leading-relaxed">{subtitle}</p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
