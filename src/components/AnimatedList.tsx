import { AnimatePresence, motion } from "framer-motion";
import type { Key, ReactNode } from "react";

/**
 * AnimatedList — adapted from the Magic UI "Animated List" community component
 * (21st.dev / magicui.design, MIT). Tuned to the JLL motion language: a quick,
 * restrained cascade on mount, smooth layout reflow + enter/exit when the
 * underlying list is filtered or re-sorted. No blur/neon — just opacity + lift.
 */
export function AnimatedList<T>({
  items,
  getKey,
  children,
  className,
  stagger = 0.045,
}: {
  items: T[];
  getKey: (item: T) => Key;
  children: (item: T) => ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={getKey(item)}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: i * stagger, type: "spring", stiffness: 320, damping: 30 },
            }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
          >
            {children(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
