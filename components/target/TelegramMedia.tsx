"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TG_LINK, TARGET_VIDEO_THUMBNAILS } from "@/lib/constants";

export default function TelegramMedia() {
  const { t } = useT();

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold max-w-lg leading-tight text-on-surface">
              {t("target.tg.heading")}
            </h2>
            <a
              href={TG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all flex items-center gap-3 shrink-0"
            >
              <span className="material-symbols-outlined">send</span>
              {t("target.tg.cta")}
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16 md:mb-20">
            {TARGET_VIDEO_THUMBNAILS.map((src, i) => (
              <div key={i} className="aspect-[9/16] bg-surface-container rounded-xl overflow-hidden double-bezel">
                <img
                  className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300"
                  src={src}
                  alt=""
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="text-center opacity-30">
            <p className="text-[10px] uppercase tracking-[0.5em] mb-4 text-on-surface-variant">
              {t("target.press.label")}
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 font-bold text-lg md:text-xl text-on-surface">
              <span>FORBES.RU</span>
              <span>VC.RU</span>
              <span>BUSINESS DAILY</span>
              <span>TECH TRENDS</span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
