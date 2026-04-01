"use client";

import { useModal } from "@/lib/modal-context";

export default function CTAButton({
  text,
  size = "default",
  glow = false,
  className = "",
}: {
  text: string;
  size?: "default" | "large";
  glow?: boolean;
  className?: string;
}) {
  const { openModal } = useModal();
  const isLarge = size === "large";

  return (
    <button
      type="button"
      onClick={openModal}
      className={`
        group inline-flex items-center gap-3 rounded-full whitespace-nowrap
        cta-btn text-white cursor-pointer
        transition-all duration-200 active:scale-[0.98]
        hover:scale-[1.03] w-fit
        ${isLarge ? "px-8 py-5 text-base md:px-10 md:text-lg" : "px-6 py-4 text-sm md:px-8 md:text-base"}
        ${glow ? "animate-pulse-glow" : ""}
        ${className}
      `}
    >
      <span className="font-bold tracking-wide">{text}</span>
      <span className="bg-white/20 group-hover:bg-white/32 w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-200">
        <span className="material-symbols-outlined leading-none text-lg">arrow_forward</span>
      </span>
    </button>
  );
}
