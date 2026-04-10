'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

/**
 * Client-only wrapper that loads framer-motion DOM features once and allows
 * all game components to use the lightweight `m.X` primitives instead of
 * `motion.X`. In combination with `strict`, any remaining `motion.X` usage
 * will throw at dev time, so we catch drift immediately.
 *
 * Bundle impact: full `motion` ships every feature (~120 KB); `m` +
 * `domAnimation` bundles only the DOM animation subset (~40-60 KB saved).
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
