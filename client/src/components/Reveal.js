import { motion } from 'framer-motion';

/**
 * Wrap any content in <Reveal> to make it fade in and gently slide up
 * into place the first time it scrolls into view. Kept deliberately
 * subtle — small distance, quick settle, no bounce, no rotation.
 */
export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrap a grid/list in <RevealGroup> and each direct motion.div child
 * (use RevealItem) will stagger in slightly after the previous one.
 */
export const revealContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const revealItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};