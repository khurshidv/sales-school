"use client";

import FadeUp from "../FadeUp";
import { useT } from "@/lib/i18n";
import { TARGET_STUDENTS } from "@/lib/constants";

const row1 = TARGET_STUDENTS.slice(0, 10);
const row2 = TARGET_STUDENTS.slice(10);

function StudentCard({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: "140px" }}>
      <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden double-bezel">
        <img
          className="w-full h-full object-cover"
          src={`/students/${slug}.jpg`}
          alt={name}
          width={120}
          height={120}
          loading="lazy"
        />
      </div>
      <span className="text-sm font-semibold text-on-surface text-center whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: typeof TARGET_STUDENTS;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        overflow: "hidden",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          gap: "24px",
          animation: reverse
            ? "marquee-reverse 40s linear infinite"
            : "marquee-fwd 35s linear infinite",
        }}
      >
        {doubled.map((student, i) => (
          <StudentCard key={`${student.slug}-${i}`} slug={student.slug} name={student.name} />
        ))}
      </div>
    </div>
  );
}

export default function CasesSection() {
  const { t } = useT();

  return (
    <section id="cases" className="py-20 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <FadeUp>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-12 md:mb-16 text-on-surface">
            {t("target.cases.heading")}
          </h2>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="flex flex-col gap-6">
            <MarqueeRow items={row1} />
            <MarqueeRow items={row2} reverse />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
