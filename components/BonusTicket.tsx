"use client";

import { type ReactNode } from "react";
import { useT } from "@/lib/i18n";

interface BonusTicketProps {
  number: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  mockup?: ReactNode;
}

export default function BonusTicket({ number, badge, title, description, icon, mockup }: BonusTicketProps) {
  const { t } = useT();
  return (
    <div className="bonus-card bg-white border-2 border-dashed border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group h-full">
      {/* Background Number */}
      <div className="absolute -right-2 -top-4 text-[7rem] font-[family-name:var(--font-heading)] text-secondary-container/20 leading-none select-none">
        {number}
      </div>

      <div className="relative z-10">
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {badge}
        </span>

        {mockup && (
          <div className="mt-5 mb-4">
            {mockup}
          </div>
        )}

        <h4 className="font-bold text-xl mt-4 mb-2 text-on-surface">{title}</h4>
        <p className="text-on-surface-variant text-sm">{description}</p>
      </div>

      <div className="relative z-10 mt-8 border-t border-outline-variant/10 pt-4 flex items-center gap-2 text-primary-container font-bold text-xs group/cta cursor-pointer">
        <span>{t("bonus.available")}</span>
        <span className="material-symbols-outlined text-sm group-hover/cta:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </div>
  );
}
