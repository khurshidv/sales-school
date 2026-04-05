"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TARGET_PARTNER_LOGOS } from "@/lib/constants";

const row1 = TARGET_PARTNER_LOGOS.slice(0, 11);
const row2 = TARGET_PARTNER_LOGOS.slice(11);

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        overflow: "hidden",
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          gap: "12px",
          animation: reverse
            ? "marquee-reverse 35s linear infinite"
            : "marquee-fwd 30s linear infinite",
        }}
      >
        {doubled.map((name, i) => (
          <span
            key={i}
            style={{
              whiteSpace: "nowrap",
              borderRadius: "9999px",
              border: "1px solid rgba(27,28,26,0.12)",
              background: "#fbf9f5",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(27,28,26,0.5)",
              fontFamily: "inherit",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrustBar() {
  const { t } = useT();

  return (
    <>
      <style>{`
        @keyframes marquee-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <section className="bg-surface-container-low py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center space-y-8">
          <FadeUp>
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.3em]">
              {t("target.trust.label")}
            </p>
          </FadeUp>
          <FadeUp delay={100}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <MarqueeRow items={row1} />
              <MarqueeRow items={row2} reverse />
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
