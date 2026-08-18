import { motion } from 'framer-motion';

/**
 * Wraps each page's content so switching routes feels like a soft
 * cross-fade + slight rise, instead of an abrupt jump-cut.
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}