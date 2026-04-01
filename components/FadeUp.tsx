"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AnimDirection = "up" | "left" | "right" | "scale";

const animationClasses: Record<AnimDirection, string> = {
  up: "animate-fade-up",
  left: "anim-slide-left",
  right: "anim-slide-right",
  scale: "anim-scale-in",
};

export default function FadeUp({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: AnimDirection;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`;
          el.classList.remove("opacity-0");
          el.classList.add(animationClasses[direction]);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}
