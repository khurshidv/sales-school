"use client";

import { useEffect, useState } from "react";
import { WEBINAR_DATE } from "@/lib/constants";
import { useT } from "@/lib/i18n";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = new Date(WEBINAR_DATE).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] text-primary-container tabular-nums leading-none">
        {display}
      </span>
      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
        {label}
      </span>
    </div>
  );
}

function useCountdown() {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft());
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ct = mounted ? time : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const isExpired = mounted && ct.days === 0 && ct.hours === 0 && ct.minutes === 0 && ct.seconds === 0;

  return { ct, mounted, isExpired };
}

export default function FlipClock({ className = "" }: { className?: string }) {
  const { ct, isExpired } = useCountdown();
  const { t } = useT();

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-xl md:text-2xl font-bold text-primary-container">
          {t("timer.started")}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-start gap-3 md:gap-6 ${className}`}>
      <TimeBox value={ct.days} label={t("timer.days")} />
      <span className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] text-on-surface-variant/30 mt-1">:</span>
      <TimeBox value={ct.hours} label={t("timer.hours")} />
      <span className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] text-on-surface-variant/30 mt-1">:</span>
      <TimeBox value={ct.minutes} label={t("timer.minutes")} />
      <span className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] text-on-surface-variant/30 mt-1">:</span>
      <TimeBox value={ct.seconds} label={t("timer.seconds")} />
    </div>
  );
}

/* 2×2 grid countdown — used next to CTA button on mobile */
export function CompactCountdown({ className = "" }: { className?: string }) {
  const { ct, mounted, isExpired } = useCountdown();
  const { t } = useT();

  if (!mounted || isExpired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { value: ct.days,    label: t("timer.days") },
    { value: ct.hours,   label: t("timer.hours") },
    { value: ct.minutes, label: t("timer.minutes") },
    { value: ct.seconds, label: t("timer.seconds") },
  ];

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {units.map(({ value, label }, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-[13px] font-[family-name:var(--font-heading)] font-bold text-primary-container tabular-nums leading-none">
            {pad(value)}
          </span>
          <span className="text-[7px] font-black uppercase tracking-wide text-on-surface-variant/50 leading-tight mt-[2px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function InlineCountdown({ className = "" }: { className?: string }) {
  const { ct, mounted, isExpired } = useCountdown();
  const { t } = useT();

  if (!mounted) return null;
  if (isExpired) return <span className={className}>{t("timer.started")}</span>;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className={`font-[family-name:var(--font-heading)] tabular-nums ${className}`}>
      <span>{pad(ct.days)}</span>
      <span className="text-on-surface-variant/50 mx-0.5 text-[10px] min-[360px]:text-xs lowercase">{t("timer.days")}</span>
      <span>{pad(ct.hours)}</span>
      <span className="text-on-surface-variant/50 mx-0.5 text-[10px] min-[360px]:text-xs lowercase">{t("timer.hours")}</span>
      <span>{pad(ct.minutes)}</span>
      <span className="text-on-surface-variant/50 mx-0.5 text-[10px] min-[360px]:text-xs lowercase">{t("timer.minutes")}</span>
      <span>{pad(ct.seconds)}</span>
      <span className="text-on-surface-variant/50 mx-0.5 text-[10px] min-[360px]:text-xs lowercase">{t("timer.seconds")}</span>
    </span>
  );
}
