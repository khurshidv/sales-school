"use client";

import { useT } from "@/lib/i18n";

/** Детализированные мокапы для трёх бонусных карточек */

/* ── 01  PDF Checklist ── */
export function ChecklistMockup() {
  const { t } = useT();
  const items = [
    { label: t("mockup.skill1"), checked: true },
    { label: t("mockup.skill2"), checked: true },
    { label: t("mockup.skill3"), checked: true },
    { label: t("mockup.skill4"), checked: false },
    { label: t("mockup.skill5"), checked: false },
  ];

  return (
    <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
      {/* PDF header bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#e74c3c] flex items-center justify-center">
          <span className="text-white text-[10px] font-black">PDF</span>
        </div>
        <div>
          <div className="text-[11px] font-bold text-on-surface leading-tight">checklist_skills.pdf</div>
          <div className="text-[9px] text-on-surface-variant">245 KB</div>
        </div>
      </div>

      {/* Checklist items — blurred to tease content */}
      <div className="space-y-2.5 blur-[3px] select-none pointer-events-none">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
              item.checked
                ? "bg-[#22c55e]"
                : "border-2 border-outline-variant/40"
            }`}>
              {item.checked && (
                <span className="material-symbols-outlined text-white text-[14px]">check</span>
              )}
            </div>
            <span className={`text-xs ${item.checked ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
          <div className="h-full w-[60%] bg-[#22c55e] rounded-full" />
        </div>
        <span className="text-[10px] text-on-surface-variant font-bold">3/5</span>
      </div>
    </div>
  );
}

/* ── 02  Video Player ── */
export function VideoMockup() {
  return (
    <div className="bg-inverse-surface rounded-2xl overflow-hidden relative">
      {/* Video frame */}
      <div className="aspect-video relative flex items-center justify-center">
        {/* Fake video background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

        {/* Speaker silhouette hint */}
        <div className="absolute bottom-0 left-6 w-16 h-20 rounded-t-full bg-white/5" />

        {/* Slide content on right */}
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 w-24">
          <div className="h-1.5 bg-white/30 rounded mb-1.5 w-full" />
          <div className="h-1.5 bg-white/20 rounded mb-1.5 w-[80%]" />
          <div className="h-1.5 bg-white/15 rounded w-[60%]" />
        </div>

        {/* Play button */}
        <div className="relative z-10 w-14 h-14 bg-primary-container rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-white text-2xl ml-0.5">play_arrow</span>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          12:34
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div className="h-full w-[35%] bg-primary-container" />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white/60 text-sm">pause</span>
          <span className="material-symbols-outlined text-white/60 text-sm">volume_up</span>
          <span className="text-[10px] text-white/40 font-medium">4:21 / 12:34</span>
        </div>
        <span className="material-symbols-outlined text-white/60 text-sm">fullscreen</span>
      </div>
    </div>
  );
}

/* ── 03  Resume Template ── */
export function ResumeMockup() {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
      {/* Resume page */}
      <div className="p-5">
        {/* Header section with accent stripe */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-xl bg-primary-container/15 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-container text-xl">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-3 bg-on-surface rounded w-[70%] mb-1.5" />
            <div className="h-2 bg-primary-container/40 rounded w-[50%]" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-primary-container/20 rounded-full mb-4" />

        {/* Skills section */}
        <div className="mb-3">
          <div className="h-2 bg-on-surface/60 rounded w-[30%] mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {["CRM", "B2B", "KPI", "Скрипты"].map((tag) => (
              <span key={tag} className="bg-primary-fixed text-primary-container text-[9px] font-bold px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Experience lines */}
        <div className="space-y-2">
          <div className="h-2 bg-on-surface/40 rounded w-[35%]" />
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1 shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 bg-on-surface-variant/20 rounded w-full mb-1" />
              <div className="h-1.5 bg-on-surface-variant/15 rounded w-[85%]" />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1 shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 bg-on-surface-variant/20 rounded w-[90%] mb-1" />
              <div className="h-1.5 bg-on-surface-variant/15 rounded w-[70%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-container via-primary to-primary-container" />
    </div>
  );
}
