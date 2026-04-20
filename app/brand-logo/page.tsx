"use client";

import { useEffect, useMemo, useState } from "react";
import * as opentype from "opentype.js";

type Variant = {
  id: string;
  name: string;
  description: string;
  bg: string;
  salesColor: string;
  upColor: string;
  useGradient?: boolean;
  cardClass: string;
};

const GRADIENT_ID = "sales-up-cta-gradient";

const VARIANTS: Variant[] = [
  {
    id: "original",
    name: "Original",
    description: "Как на исходном файле — серый SALES, синий UP.",
    bg: "#FFFFFF",
    salesColor: "#6E6E6E",
    upColor: "#1E3FA8",
    cardClass: "bg-white border-neutral-200",
  },
  {
    id: "brand-primary",
    name: "Brand Primary",
    description: "Чёрный SALES + оранжевый Primary (#944A00) на кремовом фоне.",
    bg: "#FBF9F5",
    salesColor: "#1B1C1A",
    upColor: "#944A00",
    cardClass: "bg-[#FBF9F5] border-[#DDC1B0]",
  },
  {
    id: "cta-gradient",
    name: "CTA Gradient",
    description: "Градиент CTA-кнопки (145°, #B85C00 → #E8790A → #F98A28).",
    bg: "#FBF9F5",
    salesColor: "#1B1C1A",
    upColor: `url(#${GRADIENT_ID})`,
    useGradient: true,
    cardClass: "bg-[#FBF9F5] border-[#DDC1B0]",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Инверсия: светлый SALES + яркий Primary Container на тёмном фоне.",
    bg: "#1B1C1A",
    salesColor: "#E4E2DE",
    upColor: "#E8790A",
    cardClass: "bg-[#1B1C1A] border-[#30312E]",
  },
  {
    id: "mono-black",
    name: "Mono Black",
    description: "Монохром для печати и чёрно-белых носителей.",
    bg: "#FFFFFF",
    salesColor: "#1B1C1A",
    upColor: "#1B1C1A",
    cardClass: "bg-white border-neutral-200",
  },
  {
    id: "mono-white",
    name: "Mono White",
    description: "Белый монохром — для наложения на фото и тёмные фоны.",
    bg: "#30312E",
    salesColor: "#FFFFFF",
    upColor: "#FFFFFF",
    cardClass: "bg-[#30312E] border-[#30312E]",
  },
];

const FONT_SIZE = 320;
const FONT_FAMILY = "'Space Grotesk', 'Inter', 'Arial Black', sans-serif";
const PAD = 60;

type Controls = {
  salesHeightScale: number;
  salesWidthScale: number;
  salesLetterSpacing: number;
  upHeightScale: number; // vertical extent of rotated UP (= scaleX before rotation)
  upWidthScale: number; // horizontal extent of rotated UP (= scaleY before rotation)
  upLetterSpacing: number;
  gap: number;
};

const DEFAULT_CONTROLS: Controls = {
  salesHeightScale: 1,
  salesWidthScale: 1,
  salesLetterSpacing: -4,
  upHeightScale: 0.7,
  upWidthScale: 0.7,
  upLetterSpacing: -4,
  gap: 40,
};

type Layout = {
  viewW: number;
  viewH: number;
  salesPath: string;
  salesTransform: string;
  salesInkTop: number;
  salesInkBottom: number;
  upPath: string;
  upGroupTransform: string;
  ready: boolean;
};

// Fallback layout used before font+measurement load.
const FALLBACK_LAYOUT: Layout = {
  viewW: 1700,
  viewH: 420,
  salesPath: "",
  salesTransform: `translate(${PAD},340)`,
  salesInkTop: PAD,
  salesInkBottom: PAD + 232,
  upPath: "",
  upGroupTransform: "",
  ready: false,
};

type UpTransform = "none" | "rotate180" | "rotate-ccw-90" | "rotate-cw-90" | "flip-h" | "flip-v";

function buildSvg(
  v: Variant,
  layout: Layout,
  { transparent = false }: { transparent?: boolean } = {}
): string {
  if (!layout.ready) return "";
  const gradientDef = v.useGradient
    ? `<linearGradient id="${GRADIENT_ID}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(55 0.5 0.5)">
      <stop offset="0%" stop-color="#B85C00"/>
      <stop offset="50%" stop-color="#E8790A"/>
      <stop offset="100%" stop-color="#F98A28"/>
    </linearGradient>`
    : "";

  const bgRect = transparent
    ? ""
    : `<rect width="${layout.viewW}" height="${layout.viewH}" fill="${v.bg}"/>`;

  const upFill = v.useGradient ? `url(#${GRADIENT_ID})` : v.upColor;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.viewW} ${layout.viewH}" width="${layout.viewW}" height="${layout.viewH}" role="img" aria-label="Sales Up logo — ${v.name}">
  <defs>${gradientDef}</defs>
  ${bgRect}
  <path d="${layout.salesPath}" fill="${v.salesColor}" transform="${layout.salesTransform}"/>
  <path d="${layout.upPath}" fill="${upFill}" transform="${layout.upGroupTransform}"/>
</svg>`;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function LogoPreview({ v, layout, showGuides }: { v: Variant; layout: Layout; showGuides: boolean }) {
  const upFill = v.useGradient ? `url(#${GRADIENT_ID}-${v.id})` : v.upColor;
  return (
    <svg
      viewBox={`0 0 ${layout.viewW} ${layout.viewH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full h-auto"
      role="img"
      aria-label={`Sales Up logo — ${v.name}`}
    >
      {v.useGradient && (
        <defs>
          <linearGradient id={`${GRADIENT_ID}-${v.id}`} x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(55 0.5 0.5)">
            <stop offset="0%" stopColor="#B85C00" />
            <stop offset="50%" stopColor="#E8790A" />
            <stop offset="100%" stopColor="#F98A28" />
          </linearGradient>
        </defs>
      )}
      <rect width={layout.viewW} height={layout.viewH} fill={v.bg} />
      {layout.ready ? (
        <>
          <path d={layout.salesPath} fill={v.salesColor} transform={layout.salesTransform} />
          <path d={layout.upPath} fill={upFill} transform={layout.upGroupTransform} />
        </>
      ) : null}
      {showGuides && layout.ready && (
        <g pointerEvents="none">
          <line
            x1={0}
            x2={layout.viewW}
            y1={layout.salesInkTop}
            y2={layout.salesInkTop}
            stroke="#E8790A"
            strokeWidth={3}
            strokeDasharray="10 8"
            opacity={0.8}
          />
          <line
            x1={0}
            x2={layout.viewW}
            y1={layout.salesInkBottom}
            y2={layout.salesInkBottom}
            stroke="#E8790A"
            strokeWidth={3}
            strokeDasharray="10 8"
            opacity={0.8}
          />
          <text
            x={8}
            y={layout.salesInkTop - 8}
            fontSize={18}
            fill="#944A00"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
          >
            TOP
          </text>
          <text
            x={8}
            y={layout.salesInkBottom + 22}
            fontSize={18}
            fill="#944A00"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
          >
            BOTTOM
          </text>
        </g>
      )}
    </svg>
  );
}

type InkMetrics = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type TextPathData = {
  svgPath: string; // SVG "d" attribute — path data for all glyphs
  ink: InkMetrics;
};

type Metrics = { sales: TextPathData; up: TextPathData };

function computeLayout(m: Metrics, kind: UpTransform, c: Controls): Layout {
  const sIk = m.sales.ink;
  const uIk = m.up.ink;
  const is90 = kind === "rotate-ccw-90" || kind === "rotate-cw-90";

  const sSX = c.salesWidthScale;
  const sSY = c.salesHeightScale;

  const uInkH = uIk.bottom - uIk.top;
  const upInkCX = (uIk.left + uIk.right) / 2;
  const upInkCY = (uIk.top + uIk.bottom) / 2;

  const sTx = PAD - sIk.left * sSX;
  const sTy = PAD - sIk.top * sSY;
  const salesInkRight = sTx + sIk.right * sSX;
  const salesInkBottom = sTy + sIk.bottom * sSY;
  const salesInkCY = (sTy + sIk.top * sSY + salesInkBottom) / 2;
  const salesTransform = `translate(${sTx} ${sTy}) scale(${sSX} ${sSY})`;

  if (!is90) {
    const upOriginX = salesInkRight + c.gap - uIk.left;
    const upOriginY = sTy + sIk.top * sSY - uIk.top;
    const upInkBottom = upOriginY + uIk.bottom;
    const bottom = Math.max(salesInkBottom, upInkBottom);
    const viewH = bottom + PAD;
    const viewW = upOriginX + uIk.right + PAD;
    const upCX = upOriginX + upInkCX;
    const upCY = upOriginY + upInkCY;

    let upGroupTransform = `translate(${upOriginX} ${upOriginY})`;
    switch (kind) {
      case "rotate180":
        upGroupTransform = `rotate(180 ${upCX} ${upCY}) translate(${upOriginX} ${upOriginY})`;
        break;
      case "flip-h":
        upGroupTransform = `matrix(-1 0 0 1 ${2 * upCX} 0) translate(${upOriginX} ${upOriginY})`;
        break;
      case "flip-v":
        upGroupTransform = `matrix(1 0 0 -1 0 ${2 * upCY}) translate(${upOriginX} ${upOriginY})`;
        break;
    }

    return {
      viewW,
      viewH,
      salesPath: m.sales.svgPath,
      salesTransform,
      salesInkTop: sTy + sIk.top * sSY,
      salesInkBottom,
      upPath: m.up.svgPath,
      upGroupTransform,
      ready: true,
    };
  }

  const uSX = c.upHeightScale;
  const uSY = c.upWidthScale;
  const rotatedW = uInkH * uSY;
  const rotatedH = (uIk.right - uIk.left) * uSX;

  const targetCX = salesInkRight + c.gap + rotatedW / 2;
  const targetCY = salesInkCY;

  const angle = kind === "rotate-ccw-90" ? -90 : 90;
  const upGroupTransform = `translate(${targetCX} ${targetCY}) rotate(${angle}) scale(${uSX} ${uSY}) translate(${-upInkCX} ${-upInkCY})`;

  const rotatedTop = targetCY - rotatedH / 2;
  const rotatedBottom = targetCY + rotatedH / 2;
  const salesTop = PAD;
  const top = Math.min(salesTop, rotatedTop);
  const bottom = Math.max(salesInkBottom, rotatedBottom);

  const shift = Math.max(0, PAD - top);
  const shiftedSalesTransform = `translate(${sTx} ${sTy + shift}) scale(${sSX} ${sSY})`;
  const shiftedUpGroupTransform = `translate(${targetCX} ${targetCY + shift}) rotate(${angle}) scale(${uSX} ${uSY}) translate(${-upInkCX} ${-upInkCY})`;

  const viewH = bottom - top + shift + PAD;
  const viewW = targetCX + rotatedW / 2 + PAD;

  return {
    viewW,
    viewH,
    salesPath: m.sales.svgPath,
    salesTransform: shiftedSalesTransform,
    salesInkTop: sTy + shift + sIk.top * sSY,
    salesInkBottom: salesInkBottom + shift,
    upPath: m.up.svgPath,
    upGroupTransform: shiftedUpGroupTransform,
    ready: true,
  };
}

function useOpentypeFont(): opentype.Font | null {
  const [font, setFont] = useState<opentype.Font | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const buffer = await (await fetch("/fonts/SpaceGrotesk-Bold.ttf")).arrayBuffer();
        const parsed = opentype.parse(buffer);
        if (!cancelled) setFont(parsed);
      } catch {
        /* opentype not available — text-based fallback will be used */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return font;
}

function textToPath(
  font: opentype.Font,
  text: string,
  fontSize: number,
  letterSpacing: number
): TextPathData {
  // Manually position each glyph so letter-spacing is baked into the path data.
  const scale = fontSize / font.unitsPerEm;
  const paths: opentype.Path[] = [];
  let x = 0;
  const glyphs = font.stringToGlyphs(text);

  glyphs.forEach((glyph, i) => {
    const p = glyph.getPath(x, 0, fontSize);
    paths.push(p);
    const advance = (glyph.advanceWidth ?? 0) * scale;
    x += advance + letterSpacing;
  });

  // Combine all paths into one path data string.
  const svgPath = paths.map((p) => p.toPathData(2)).join(" ");

  // Compute tight ink bbox by merging individual glyph bboxes.
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  paths.forEach((p) => {
    const bb = p.getBoundingBox();
    if (bb.x1 < minX) minX = bb.x1;
    if (bb.y1 < minY) minY = bb.y1;
    if (bb.x2 > maxX) maxX = bb.x2;
    if (bb.y2 > maxY) maxY = bb.y2;
  });

  return {
    svgPath,
    ink: { left: minX, top: minY, right: maxX, bottom: maxY },
  };
}

function useLogoLayout(
  font: opentype.Font | null,
  kind: UpTransform,
  controls: Controls
): Layout {
  const metrics = useMemo<Metrics | null>(() => {
    if (!font) return null;
    return {
      sales: textToPath(font, "SALES", FONT_SIZE, controls.salesLetterSpacing),
      up: textToPath(font, "UP", FONT_SIZE, controls.upLetterSpacing),
    };
  }, [font, controls.salesLetterSpacing, controls.upLetterSpacing]);

  return useMemo(
    () => (metrics ? computeLayout(metrics, kind, controls) : FALLBACK_LAYOUT),
    [metrics, kind, controls]
  );
}

const TRANSFORM_OPTIONS: { id: UpTransform; label: string; hint: string }[] = [
  { id: "none", label: "Без поворота", hint: "UP как обычный горизонтальный текст" },
  { id: "rotate-ccw-90", label: "90° влево", hint: "UP поставлен вертикально, читается снизу вверх — как на исходной картинке" },
  { id: "rotate-cw-90", label: "90° вправо", hint: "UP поставлен вертикально, читается сверху вниз" },
  { id: "rotate180", label: "180°", hint: "UP вверх ногами и справа налево" },
  { id: "flip-v", label: "Зеркало по вертикали", hint: "Буквы перевёрнуты сверху вниз, порядок сохранён" },
  { id: "flip-h", label: "Зеркало по горизонтали", hint: "Буквы отражены слева направо" },
];

export default function BrandLogoPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [kind, setKind] = useState<UpTransform>("rotate-ccw-90");
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const font = useOpentypeFont();
  const layout = useLogoLayout(font, kind, controls);
  const updateControl = <K extends keyof Controls>(key: K, value: Controls[K]) =>
    setControls((prev) => ({ ...prev, [key]: value }));

  const cards = useMemo(
    () =>
      VARIANTS.map((v) => ({
        variant: v,
        svgWithBg: buildSvg(v, layout, { transparent: false }),
        svgTransparent: buildSvg(v, layout, { transparent: true }),
      })),
    [layout]
  );

  const copySvg = async (id: string, svg: string) => {
    try {
      await navigator.clipboard.writeText(svg);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="min-h-dvh bg-[var(--color-background,#FBF9F5)] text-[var(--color-on-surface,#1B1C1A)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDC1B0] bg-white/60 px-3 py-1 text-xs font-medium tracking-wide text-[#564336]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#944A00]" />
            Sales Up · Brand kit
          </div>
          <h1
            className="mt-5 text-4xl md:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}
          >
            Генератор вариаций логотипа
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#564336]">
            Шесть канонических версий логотипа Sales Up — со словом UP, повёрнутым вертикально
            как на оригинальном файле. Скачайте SVG с фоном или с прозрачным фоном, либо
            скопируйте исходник в буфер обмена.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#8A7264]">
            SVG использует шрифт <span className="font-semibold text-[#564336]">Space Grotesk 700</span>.
            Для размещения на платформах без этого шрифта — откройте файл в Figma или Illustrator и
            сконвертируйте текст в кривые (Create Outlines / Object → Flatten).
          </p>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8A7264]">
              Как перевернуть «UP»
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRANSFORM_OPTIONS.map((opt) => {
                const active = kind === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setKind(opt.id)}
                    title={opt.hint}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                      active
                        ? "border-[#944A00] bg-[#944A00] text-white shadow-sm"
                        : "border-neutral-300 bg-white text-[#564336] hover:bg-neutral-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[#8A7264]">
              Выберите вариант, совпадающий с исходной картинкой — все превью и скачиваемые SVG
              обновятся автоматически.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlsPanel
              title="SALES"
              height={controls.salesHeightScale}
              width={controls.salesWidthScale}
              letterSpacing={controls.salesLetterSpacing}
              onHeight={(v) => updateControl("salesHeightScale", v)}
              onWidth={(v) => updateControl("salesWidthScale", v)}
              onLetterSpacing={(v) => updateControl("salesLetterSpacing", v)}
            />
            <ControlsPanel
              title="UP"
              height={controls.upHeightScale}
              width={controls.upWidthScale}
              letterSpacing={controls.upLetterSpacing}
              onHeight={(v) => updateControl("upHeightScale", v)}
              onWidth={(v) => updateControl("upWidthScale", v)}
              onLetterSpacing={(v) => updateControl("upLetterSpacing", v)}
              extra={
                <SliderRow
                  label="Зазор до SALES"
                  value={controls.gap}
                  min={0}
                  max={200}
                  step={1}
                  unit="px"
                  onChange={(v) => updateControl("gap", v)}
                />
              }
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#8A7264]">
              Все параметры применяются ко всем 6 вариантам логотипа одновременно.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuides((v) => !v)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  showGuides
                    ? "border-[#944A00] bg-[#944A00] text-white"
                    : "border-neutral-300 bg-white text-[#564336] hover:bg-neutral-50"
                }`}
              >
                {showGuides ? "Скрыть направляющие" : "Показать направляющие"}
              </button>
              <button
                type="button"
                onClick={() => setControls(DEFAULT_CONTROLS)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-[#564336] hover:bg-neutral-50"
              >
                Сбросить настройки
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(({ variant, svgWithBg, svgTransparent }) => (
            <article
              key={variant.id}
              className={`rounded-2xl border overflow-hidden shadow-sm ${variant.cardClass}`}
            >
              <div className="flex items-center justify-center px-6 py-10">
                <LogoPreview v={variant} layout={layout} showGuides={showGuides} />
              </div>
              <div className="p-5 bg-white border-t border-neutral-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-lg font-bold text-[#1B1C1A]"
                      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                    >
                      {variant.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#564336] max-w-sm">{variant.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#8A7264]">
                    <span
                      className="h-4 w-4 rounded border border-neutral-300"
                      style={{ background: variant.salesColor }}
                      title={`SALES ${variant.salesColor}`}
                    />
                    <span
                      className="h-4 w-4 rounded border border-neutral-300"
                      style={{
                        background: variant.useGradient
                          ? "linear-gradient(145deg, #B85C00 0%, #E8790A 50%, #F98A28 100%)"
                          : variant.upColor,
                      }}
                      title={`UP ${variant.upColor}`}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadFile(`salesup-${variant.id}.svg`, svgWithBg, "image/svg+xml")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#944A00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7a3d00] active:scale-[0.98]"
                  >
                    <DownloadIcon />
                    SVG с фоном
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(`salesup-${variant.id}-transparent.svg`, svgTransparent, "image/svg+xml")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#944A00] px-4 py-2 text-xs font-semibold text-[#944A00] transition hover:bg-[#944A00]/5 active:scale-[0.98]"
                  >
                    <DownloadIcon />
                    Прозрачный SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => copySvg(variant.id, svgWithBg)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-[#564336] transition hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    {copiedId === variant.id ? <CheckIcon /> : <CopyIcon />}
                    {copiedId === variant.id ? "Скопировано" : "Скопировать SVG"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-14 rounded-2xl border border-[#DDC1B0] bg-white/60 p-6 text-sm text-[#564336]">
          <h3
            className="text-base font-bold text-[#1B1C1A]"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Brand colors
          </h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Swatch name="Primary" hex="#944A00" />
            <Swatch name="Primary Container" hex="#E8790A" />
            <Swatch name="Background" hex="#FBF9F5" />
            <Swatch name="On Surface" hex="#1B1C1A" />
          </div>
        </footer>
      </div>
    </main>
  );
}

function ControlsPanel({
  title,
  height,
  width,
  letterSpacing,
  onHeight,
  onWidth,
  onLetterSpacing,
  extra,
}: {
  title: string;
  height: number;
  width: number;
  letterSpacing: number;
  onHeight: (v: number) => void;
  onWidth: (v: number) => void;
  onLetterSpacing: (v: number) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#DDC1B0] bg-white/70 p-5">
      <div className="flex items-center gap-2">
        <span
          className="rounded-full bg-[#944A00] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          {title}
        </span>
        <span className="text-xs font-medium text-[#564336]">Настройки текста</span>
      </div>
      <div className="mt-4 space-y-3">
        <SliderRow label="Высота" value={height} min={0.3} max={2} step={0.01} onChange={onHeight} />
        <SliderRow label="Ширина" value={width} min={0.3} max={2} step={0.01} onChange={onWidth} />
        <SliderRow
          label="Расстояние между буквами"
          value={letterSpacing}
          min={-30}
          max={40}
          step={1}
          unit="px"
          onChange={onLetterSpacing}
        />
        {extra}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const display = unit === "px" ? `${Math.round(value)}${unit}` : value.toFixed(2);
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-[#564336]">{label}</span>
        <span className="font-mono text-[#8A7264]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#944A00]"
      />
    </label>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
      <span className="h-8 w-8 rounded-md border border-neutral-300" style={{ background: hex }} />
      <div>
        <div className="font-semibold text-[#1B1C1A]">{name}</div>
        <div className="font-mono text-[10px] text-[#8A7264]">{hex}</div>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
