"use client";

import CTAButton from "./CTAButton";
import CountUp from "./CountUp";
import FadeUp from "./FadeUp";
import { CompactCountdown } from "./FlipClock";
import { REGISTRATION_COUNT, WEBINAR_DATE, AVATAR_IMAGES } from "@/lib/constants";
import { useT, type TranslationKey } from "@/lib/i18n";

export default function HeroSection() {
  const { t, locale } = useT();

  function formatDate(iso: string) {
    const parts = iso.split("T")[0].split("-");
    const day = parseInt(parts[2], 10);
    const monthKey = `month.${parseInt(parts[1], 10)}` as TranslationKey;
    const month = t(monthKey);
    return `${day} ${month}`;
  }

  const dateLabel = formatDate(WEBINAR_DATE);

  const steps = [
    { num: "01", text: t("hero.step1") },
    { num: "02", text: t("hero.step2") },
    { num: "03", text: t("hero.step3") },
    { num: "04", text: t("hero.step4") },
  ];

  return (
    <section className="relative pt-[88px] pb-[35px] md:pt-32 md:pb-[50px] mesh-hero overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Two-column layout: left content + right outcome card */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">

          {/* ── Left column ── */}
          <div className="flex flex-col items-start flex-1 max-w-2xl">

            {/* Social proof BEFORE headline — credibility first */}
            <FadeUp delay={100}>
              <div className="flex items-center gap-3 mb-7 bg-surface-container-low/50 backdrop-blur-sm p-2.5 pr-5 rounded-full border border-outline-variant/10">
                <div className="flex -space-x-2 shrink-0">
                  {AVATAR_IMAGES.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      width={36}
                      height={36}
                      loading="lazy"
                      className="w-9 h-9 rounded-full border-[3px] border-surface-container-low object-cover"
                    />
                  ))}
                </div>
                <span className="text-on-surface-variant text-sm font-semibold">
                  <CountUp
                    target={REGISTRATION_COUNT}
                    className="text-primary-container font-bold tabular-nums"
                  />{" "}
                  {t("hero.registered")}
                </span>
              </div>
            </FadeUp>

            {/* H1 */}
            <FadeUp delay={200} className="w-full">
              <h1 className="font-[family-name:var(--font-heading)] font-bold text-2xl md:text-3xl lg:text-4xl text-on-surface leading-[1.25] tracking-[-0.02em] mb-8 md:mb-10 text-center md:text-left w-full lg:max-w-[420px]">
                {t("hero.heading").split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </FadeUp>

            {/* Bullet points */}
            <FadeUp delay={300}>
              <ul className="space-y-3 mb-10 md:mb-12 max-w-xl">
                {([
                  { key: "hero.bullet1", icon: "search" },
                  { key: "hero.bullet2", icon: "record_voice_over" },
                  { key: "hero.bullet3", icon: "payments" },
                ] as const).map(({ key, icon }, i) => (
                  <li key={i} className="flex items-start gap-3 text-base md:text-lg text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-primary-container text-xl mt-0.5 shrink-0">{icon}</span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* CTA block */}
            <FadeUp delay={400}>
              <div id="hero-cta" className="flex flex-col items-center gap-3 w-full">
                {/* Button full width */}
                <CTAButton text={t("hero.cta")} className="!w-full justify-center" />
                {/* Timer directly below, centered */}
                <CompactCountdown className="md:hidden" />
                {/* Checkmarks centered */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] md:text-sm text-on-surface-variant/70 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    {t("hero.free")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    {t("hero.bonuses_tg")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    {t("hero.no_strings")}
                  </span>
                </div>
              </div>
            </FadeUp>

          </div>

          {/* ── Right column: Bento grid ── */}
          <div className="w-full mt-10 lg:mt-0 lg:w-[480px] lg:shrink-0">
            <FadeUp delay={350} direction="right">
              <div className="grid grid-cols-2 gap-3">

                {/* Income card — spans full width, hero emphasis */}
                <div className="col-span-2 bg-white/95 backdrop-blur-xl p-6 md:p-7 rounded-2xl double-bezel bento-card">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-on-surface-variant font-black uppercase text-[10px] tracking-[0.2em] mb-2">{t("hero.badge_income_label")}</span>
                      <div className="font-[family-name:var(--font-heading)] leading-none">
                        <span className="text-gradient-orange text-5xl md:text-6xl font-bold">$<CountUp target={800} duration={2000} /></span>
                        <span className="text-gradient-orange text-2xl md:text-3xl font-bold">/{locale === "ru" ? "мес" : "oy"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                        <span className="material-symbols-outlined text-primary-container text-base">trending_up</span>
                        <span className="text-on-surface font-bold text-sm">{locale === "ru" ? "В первый месяц" : "Birinchi oyda"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                        <span className="material-symbols-outlined text-primary-container text-base">business_center</span>
                        <span className="text-on-surface font-bold text-sm">{locale === "ru" ? "В топ-компаниях" : "Top kompaniyalarda"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration card */}
                <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl double-bezel bento-card">
                  <span className="block text-on-surface-variant font-black uppercase text-[10px] tracking-[0.2em] mb-2">{t("hero.badge_days_label")}</span>
                  <div className="font-[family-name:var(--font-heading)] leading-none mb-4">
                    <span className="text-gradient-orange text-4xl font-bold">30</span>
                    <span className="text-gradient-orange text-xl font-bold"> {locale === "ru" ? "дней" : "kun"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                      <span className="material-symbols-outlined text-primary-container text-base">schedule</span>
                      <span className="text-on-surface font-bold text-xs">{locale === "ru" ? "1–2 часа в день" : "Kuniga 1–2 soat"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                      <span className="material-symbols-outlined text-primary-container text-base">bolt</span>
                      <span className="text-on-surface font-bold text-xs">{locale === "ru" ? "Пошаговый план" : "Bosqichma-bosqich"}</span>
                    </div>
                  </div>
                </div>

                {/* No experience card */}
                <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl double-bezel bento-card">
                  <span className="block text-on-surface-variant font-black uppercase text-[10px] tracking-[0.2em] mb-2">{t("hero.badge_noexp_label")}</span>
                  <div className="font-[family-name:var(--font-heading)] leading-none mb-4">
                    <span className="text-gradient-orange text-2xl font-bold">{t("hero.badge_noexp")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                      <span className="material-symbols-outlined text-badge-green text-base">school</span>
                      <span className="text-on-surface font-bold text-xs">{locale === "ru" ? "Нулевой уровень — ок" : "Noldan boshlanadi"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container/70 px-3 py-2 rounded-xl">
                      <span className="material-symbols-outlined text-badge-green text-base">support_agent</span>
                      <span className="text-on-surface font-bold text-xs">{locale === "ru" ? "Поддержка ментора" : "Mentor bilan"}</span>
                    </div>
                  </div>
                </div>

              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3">
        {steps.map((step, i) => (
          <FadeUp key={step.num} delay={600 + i * 150} className="h-full">
            <div className="relative flex items-stretch h-full">
              <div className="step-card bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-primary-container/15 cursor-default flex-1 group flex flex-col">
                <span className="text-gradient-orange font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold">{step.num}</span>
                <p className="text-sm font-bold text-on-surface-variant mt-3 uppercase tracking-tight">{step.text}</p>
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-primary-container/0 via-primary-container/40 to-primary-container/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
