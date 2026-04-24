"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";

const CHART_DATA = [
  { year: 1, withTeam: 100, without: 100 },
  { year: 2, withTeam: 180, without: 115 },
  { year: 3, withTeam: 300, without: 145 },
  { year: 4, withTeam: 490, without: 165 },
  { year: 5, withTeam: 700, without: 200 },
];
const CHART_MAX = 700;
const Y_TICKS = [700, 500, 300, 100];

const REASON_ICONS = ["payments", "public", "person_search", "trending_up", "military_tech"];

export default function WhySales() {
  const { t } = useT();

  const reasons = [1, 2, 3, 4, 5].map((n) => ({
    icon: REASON_ICONS[n - 1],
    title: t(`target.why.reason.${n}.title` as TranslationKey),
    desc: t(`target.why.reason.${n}.desc` as TranslationKey),
  }));

  const stats = [1, 2, 3].map((n) => ({
    value: t(`target.why.stat${n}.value` as TranslationKey),
    label: t(`target.why.stat${n}.label` as TranslationKey),
  }));

  return (
    <section className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <FadeUp>
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="text-secondary text-sm font-bold uppercase tracking-widest">
              {t("target.why.label")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4 mb-4 md:mb-6 text-on-surface">
              {t("target.why.heading")}
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              {t("target.why.subheading")}
            </p>
          </div>
        </FadeUp>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-14">
          {stats.map((s, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="bg-white rounded-2xl p-6 md:p-8 double-bezel">
                <p className="text-4xl md:text-5xl font-bold text-primary-container mb-2">
                  {s.value}
                </p>
                <p className="text-on-surface-variant text-sm md:text-base">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Chart */}
        <FadeUp delay={100}>
          <div className="bg-white rounded-2xl p-5 md:p-8 double-bezel mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-bold text-on-surface">
                {t("target.why.chart.title")}
              </h3>
              <div className="flex flex-wrap gap-4 text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary-container shrink-0" />
                  <span className="text-on-surface-variant">{t("target.why.chart.with")}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-outline-variant/60 shrink-0" />
                  <span className="text-on-surface-variant">{t("target.why.chart.without")}</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3 md:gap-5">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between text-[10px] md:text-xs text-on-surface-variant/60 h-56 md:h-72 py-1">
                {Y_TICKS.map((v) => (
                  <span key={v} className="leading-none">
                    {v}
                  </span>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 grid grid-cols-5 gap-2 md:gap-6 h-56 md:h-72 border-l border-b border-outline-variant/30 pl-2 md:pl-4 pb-1 relative">
                {/* Grid lines */}
                {Y_TICKS.map((v) => (
                  <span
                    key={v}
                    className="absolute left-0 right-0 border-t border-outline-variant/15 pointer-events-none"
                    style={{ bottom: `${(v / CHART_MAX) * 100}%` }}
                  />
                ))}

                {CHART_DATA.map((d) => {
                  const hWith = (d.withTeam / CHART_MAX) * 100;
                  const hWithout = (d.without / CHART_MAX) * 100;
                  return (
                    <div key={d.year} className="flex items-end justify-center gap-1 md:gap-1.5 relative">
                      <div
                        className="flex-1 bg-primary-container rounded-t-sm transition-all relative group"
                        style={{ height: `${hWith}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.withTeam}
                        </span>
                      </div>
                      <div
                        className="flex-1 bg-outline-variant/60 rounded-t-sm relative group"
                        style={{ height: `${hWithout}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.without}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex gap-3 md:gap-5 mt-2">
              <div className="w-[18px] md:w-[26px]" />
              <div className="flex-1 grid grid-cols-5 gap-2 md:gap-6 pl-2 md:pl-4">
                {CHART_DATA.map((d) => (
                  <span
                    key={d.year}
                    className="text-center text-[11px] md:text-xs text-on-surface-variant"
                  >
                    {d.year} {t("target.why.chart.year")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* 5 reasons */}
        <FadeUp>
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-on-surface mb-6 md:mb-10 max-w-3xl">
            {t("target.why.reasons_title")}
          </h3>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reasons.map((r, i) => (
            <FadeUp key={i} delay={i * 60}>
              <div className="h-full bg-white rounded-2xl p-6 md:p-7 double-bezel flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-primary-container font-bold text-2xl md:text-3xl tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="material-symbols-outlined text-primary-container/70 text-2xl">
                    {r.icon}
                  </span>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-on-surface">{r.title}</h4>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Pull quote */}
        <FadeUp delay={150}>
          <blockquote className="mt-12 md:mt-16 max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-heading font-bold text-on-surface leading-snug">
              «{t("target.why.quote")}»
            </p>
          </blockquote>
        </FadeUp>
      </div>
    </section>
  );
}
