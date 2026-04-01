"use client";

import FadeUp from "./FadeUp";
import BeforeAfter from "./BeforeAfter";
import BonusTicket from "./BonusTicket";
import { ChecklistMockup, VideoMockup, ResumeMockup } from "./BonusMockups";
import SpeakerCard from "./SpeakerCard";
import FAQAccordion from "./FAQAccordion";
import CTAButton from "./CTAButton";
import { useT } from "@/lib/i18n";
import {
  FOUNDER_NAME,
  FOUNDER_STATS,
  FOUNDER_IMAGE,
  MENTOR_NAME,
  MENTOR_STATS,
  MENTOR_IMAGE,
} from "@/lib/constants";

function renderBoldOrange(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold text-primary-container">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ValueSection() {
  const { t, locale } = useT();

  const bonuses = [
    {
      number: "01",
      badge: t("bonus.1.badge"),
      title: t("bonus.1.title"),
      description: t("bonus.1.desc"),
      icon: "download",
    },
    {
      number: "02",
      badge: t("bonus.2.badge"),
      title: t("bonus.2.title"),
      description: t("bonus.2.desc"),
      icon: "play_circle",
    },
    {
      number: "03",
      badge: t("bonus.3.badge"),
      title: t("bonus.3.title"),
      description: t("bonus.3.desc"),
      icon: "edit_document",
    },
  ];
  return (
    <section id="value" className="py-[35px] md:py-[50px] bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Block A — Before / After */}
        <FadeUp>
          <div className="mb-[70px] md:mb-[100px]">
            <div className="mb-16 md:mb-20">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl text-on-surface flex flex-wrap md:flex-nowrap items-baseline gap-3 md:gap-5">
                <span className="text-on-surface-variant/40 text-4xl md:text-6xl whitespace-nowrap">0 <span className="text-2xl md:text-4xl">{locale === "ru" ? "с нуля" : "dan"}</span></span>
                <span className="material-symbols-outlined text-primary-container text-3xl md:text-4xl !leading-none">arrow_forward</span>
                <span className="text-gradient-orange">{t("value.before_after_heading")}</span>
                <span className="text-on-surface-variant text-lg md:text-xl font-normal">{t("value.before_after_desc")}</span>
              </h2>
            </div>
            <BeforeAfter />
            <div className="mt-10 flex justify-center">
              <CTAButton text={t("hero.cta")} fullWidth />
            </div>
          </div>
        </FadeUp>

        {/* Block B — Bonuses */}
        <div className="mb-[70px] md:mb-[100px]">
          <FadeUp delay={0}>
            <div className="flex justify-between items-end mb-12">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-on-surface">
                {renderBoldOrange(t("value.bonuses_heading"))}
              </h3>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
            <FadeUp delay={100} direction="left" className="h-full"><BonusTicket {...bonuses[0]} mockup={<ChecklistMockup />} /></FadeUp>
            <FadeUp delay={200} direction="scale" className="h-full"><BonusTicket {...bonuses[1]} mockup={<VideoMockup />} /></FadeUp>
            <FadeUp delay={300} direction="right" className="h-full"><BonusTicket {...bonuses[2]} mockup={<ResumeMockup />} /></FadeUp>
          </div>

          <FadeUp delay={400}>
            <div className="mt-10 flex justify-center">
              <CTAButton text={t("hero.cta")} fullWidth />
            </div>
          </FadeUp>
        </div>

        {/* Block C — Speakers */}
        <div id="speakers" className="mb-[70px] md:mb-[100px]">
          <FadeUp>
            <h3 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-on-surface mb-12">
              {t("value.speakers_heading")}
            </h3>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <FadeUp delay={100} direction="left">
              <div className="speaker-card rounded-3xl">
                <SpeakerCard
                  name={FOUNDER_NAME}
                  role={t("speaker.founder_role")}
                  stats={FOUNDER_STATS}
                  image={FOUNDER_IMAGE}
                />
              </div>
            </FadeUp>
            <FadeUp delay={250} direction="right">
              <div className="speaker-card rounded-3xl">
                <SpeakerCard
                  name={MENTOR_NAME}
                  role={t("speaker.mentor_role")}
                  stats={MENTOR_STATS}
                  image={MENTOR_IMAGE}
                />
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={350}>
            <div className="mt-10 flex justify-center">
              <CTAButton text={t("hero.cta")} fullWidth />
            </div>
          </FadeUp>
        </div>

        {/* Block D — Premium Office & Dress Code */}
        <div className="mb-[70px] md:mb-[100px]">
          <FadeUp>
            <div className="mb-12 md:mb-16">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl md:text-4xl text-on-surface max-w-3xl leading-tight">
                {t("office.heading")}
              </h3>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                num: "01",
                title: t("office.card1_title"),
                desc: t("office.card1_desc"),
                img: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop&q=80",
              },
              {
                num: "02",
                title: t("office.card2_title"),
                desc: t("office.card2_desc"),
                img: "/office-pro.png",
              },
              {
                num: "03",
                title: t("office.card3_title"),
                desc: t("office.card3_desc"),
                img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&q=80",
              },
            ].map((card, i) => (
              <FadeUp key={i} delay={i * 120} direction={i === 0 ? "left" : i === 2 ? "right" : "scale"}>
                <div className="bg-surface-container rounded-3xl overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl m-2">
                    <img src={card.img} alt={card.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-5 pt-4 pb-6">
                    <span className="text-primary-container font-[family-name:var(--font-heading)] font-bold text-xs tracking-[0.15em] block mb-2">{card.num}</span>
                    <h4 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface mb-1.5">{card.title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Block E — Telegram Channel */}
        <FadeUp delay={300}>
          <div className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-10 md:p-16 mb-[70px] md:mb-[100px] relative overflow-hidden">
            {/* Background glow orbs */}
            <div className="glow-orb w-40 h-40 bg-primary-container/30 -top-10 -left-10" />
            <div className="glow-orb w-32 h-32 bg-primary-container/20 -bottom-8 -right-8" style={{ animationDelay: "2s" }} />

            <div className="max-w-3xl mx-auto text-center relative z-10">
              {/* Telegram icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2AABEE]/20 mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#2AABEE] fill-current">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>

              <h3 className="font-[family-name:var(--font-heading)] text-2xl md:text-4xl mb-4">
                {t("tg.heading")}
              </h3>
              <p className="text-inverse-on-surface/70 text-lg mb-10">
                {t("tg.desc")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-10">
                <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl mt-0.5">lightbulb</span>
                  <div>
                    <span className="font-bold block">{t("tg.tips_title")}</span>
                    <span className="text-inverse-on-surface/60 text-sm">{t("tg.tips_desc")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl mt-0.5">school</span>
                  <div>
                    <span className="font-bold block">{t("tg.lessons_title")}</span>
                    <span className="text-inverse-on-surface/60 text-sm">{t("tg.lessons_desc")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl mt-0.5">folder_open</span>
                  <div>
                    <span className="font-bold block">{t("tg.materials_title")}</span>
                    <span className="text-inverse-on-surface/60 text-sm">{t("tg.materials_desc")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl mt-0.5">groups</span>
                  <div>
                    <span className="font-bold block">{t("tg.community_title")}</span>
                    <span className="text-inverse-on-surface/60 text-sm">{t("tg.community_desc")}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <CTAButton text={t("tg.cta")} size="large" glow />
              </div>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Block F — FAQ */}
      <div id="faq" className="py-[70px] md:py-[100px] bg-surface-container-low">
        <FadeUp delay={300}>
          <div className="max-w-3xl mx-auto px-6 text-center mb-12 md:mb-16">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-on-surface">
              {t("value.faq_heading")}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto px-6">
            <FAQAccordion />
            <div className="mt-10 flex justify-center">
              <CTAButton text={t("action.cta")} size="large" glow fullWidth />
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
