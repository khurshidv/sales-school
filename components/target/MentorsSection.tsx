"use client";

import FadeUp from "../FadeUp";
import { useT, type TranslationKey } from "@/lib/i18n";
import { TARGET_MENTOR_IMAGES } from "@/lib/constants";

export default function MentorsSection() {
  const { t } = useT();

  const mentors = [1, 2, 3].map((n) => ({
    name: t(`target.mentor.${n}.name` as TranslationKey),
    role: t(`target.mentor.${n}.role` as TranslationKey),
    desc: t(`target.mentor.${n}.desc` as TranslationKey),
    img: TARGET_MENTOR_IMAGES[n - 1],
  }));

  return (
    <section id="mentors" className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6 md:gap-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
              {t("target.mentors.heading")}
            </h2>
            <div className="px-5 py-2.5 bg-secondary-container rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-on-secondary-container">
                shield_with_heart
              </span>
              <span className="text-on-secondary-container font-bold text-sm uppercase">
                {t("target.mentors.guarantee")}
              </span>
            </div>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {mentors.map((mentor, i) => (
            <FadeUp key={i} delay={i * 100}>
              <div className="bg-white p-6 md:p-8 rounded-2xl double-bezel group hover:border-primary-container transition-colors border border-transparent">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container rounded-full mb-5 md:mb-6 overflow-hidden">
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    src={mentor.img}
                    alt={mentor.name}
                    loading="lazy"
                  />
                </div>
                <h4 className="text-lg md:text-xl font-bold mb-1 text-on-surface">{mentor.name}</h4>
                <p className="text-primary-container text-xs font-bold uppercase mb-3 md:mb-4 tracking-widest">
                  {mentor.role}
                </p>
                <p className="text-on-surface-variant text-sm">{mentor.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
