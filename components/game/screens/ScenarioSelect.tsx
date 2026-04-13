'use client'

interface ScenarioSelectProps {
  playerName: string
  playerLevel: number
  playerCoins: number
  onSelectScenario: (scenarioId: string) => void
  lang?: 'uz' | 'ru'
}

const t = {
  open: { uz: 'OCHIQ', ru: 'ОТКРЫТ' },
  soon: { uz: 'Tez kunda', ru: 'Скоро' },
  level: { uz: 'Daraja', ru: 'Уровень' },
  chevrolet: { uz: 'Chevrolet avtosaloni', ru: 'Автосалон Chevrolet' },
  duration: { uz: '3 kun · 7–10 daq', ru: '3 дня · 7–10 мин' },
  unlockHint: {
    uz: "Avtosalonni o'ting → ko'chmas mulkni oching!",
    ru: 'Пройди автосалон → открой недвижимость!',
  },
  realEstate: { uz: "Ko'chmas mulk", ru: 'Недвижимость' },
  electronics: { uz: 'Elektronika', ru: 'Электроника' },
  furniture: { uz: 'Mebel', ru: 'Мебель' },
  play: { uz: 'BOSHLASH', ru: 'НАЧАТЬ' },
  select: { uz: 'SCENARIY TANLANG', ru: 'ВЫБОР СЦЕНАРИЯ' },
} as const

type LockedCard = {
  icon: string
  titleKey: 'realEstate' | 'electronics' | 'furniture'
  days: string
}

const lockedCards: LockedCard[] = [
  { icon: 'home', titleKey: 'realEstate', days: '5' },
  { icon: 'smartphone', titleKey: 'electronics', days: '4' },
  { icon: 'chair', titleKey: 'furniture', days: '3' },
]

export default function ScenarioSelect({
  playerName,
  playerLevel,
  playerCoins,
  onSelectScenario,
  lang = 'uz',
}: ScenarioSelectProps) {
  return (
    <div className="h-full w-full mesh-game-light text-on-surface relative overflow-hidden">
      {/* Ambient orbs for depth */}
      <div
        className="glow-orb"
        style={{
          width: 340,
          height: 340,
          top: -100,
          left: -80,
          background: 'radial-gradient(circle, rgba(232,121,10,0.25) 0%, transparent 70%)',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 280,
          height: 280,
          bottom: -80,
          right: -60,
          background: 'radial-gradient(circle, rgba(148,74,0,0.18) 0%, transparent 70%)',
          animationDelay: '1.5s',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff9a3c] via-[#e8790a] to-[#944a00] flex items-center justify-center font-heading font-bold text-sm text-white"
            style={{ boxShadow: '0 6px 18px -4px rgba(232,121,10,0.5), inset 0 1px 0 rgba(255,255,255,0.35)' }}
          >
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-heading font-bold text-on-surface">{playerName}</span>
            <span className="text-[10px] font-heading uppercase tracking-widest text-on-surface-variant/70">
              Lv.{playerLevel}
            </span>
          </div>
        </div>

        {/* Center title */}
        <span className="hidden sm:block font-heading text-[11px] uppercase tracking-[0.3em] text-on-surface-variant/60">
          {t.select[lang]}
        </span>

        {/* Coin pill */}
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-[#e8790a]/25 rounded-full px-3 py-1.5 shadow-sm">
          <span
            className="material-symbols-outlined text-[#e8790a]"
            style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
          >
            paid
          </span>
          <span className="font-heading font-bold text-sm text-[#944a00]">{playerCoins}</span>
        </div>
      </div>

      {/* Main bento layout: featured (left) + vertical locked stack (right) */}
      <div className="absolute inset-0 pt-16 pb-12 px-5 flex items-center gap-4">
        {/* === FEATURED CARD — height matches locked stack === */}
        <button
          onClick={() => onSelectScenario('car-dealership')}
          className="scenario-featured-card group flex-none w-[48%] max-w-[420px] h-[75%] overflow-hidden text-left"
        >
          {/* Background showroom image */}
          <img
            src="/assets/scenarios/car-dealership/backgrounds/bg_showroom.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
          />

          {/* Top row: level pill + open badge */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#e8790a]/30 rounded-full px-3 py-1">
              <span
                className="material-symbols-outlined text-[#e8790a]"
                style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#944a00]">
                {t.level[lang]} 1
              </span>
            </div>

            <span className="badge-shimmer bg-[#22c55e] text-white text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(34,197,94,0.35)]">
              {t.open[lang]}
            </span>
          </div>

          {/* Bottom meta panel */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10 z-10">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="font-heading font-bold text-on-surface text-xl leading-tight tracking-tight">
                  {t.chevrolet[lang]}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="material-symbols-outlined text-on-surface-variant/70"
                    style={{ fontSize: 14 }}
                  >
                    schedule
                  </span>
                  <span className="text-[11px] font-body font-medium text-on-surface-variant/80">
                    {t.duration[lang]}
                  </span>
                </div>
              </div>

              {/* Play pill button */}
              <div className="cta-btn flex items-center gap-2 px-4 py-2.5 rounded-full pointer-events-none">
                <span className="font-heading font-bold text-white text-[11px] uppercase tracking-[0.15em]">
                  {t.play[lang]}
                </span>
                <span className="text-white text-sm leading-none">▶</span>
              </div>
            </div>
          </div>
        </button>

        {/* === LOCKED STACK — small vertical list === */}
        <div className="flex-1 h-[75%] flex flex-col justify-center gap-2.5 min-w-0">
          {lockedCards.map((card, idx) => (
            <div
              key={card.titleKey}
              aria-disabled="true"
              className="scenario-locked-card flex items-center gap-3 px-4 py-3 h-[28%] min-h-0"
              style={{
                opacity: 1 - idx * 0.08,
              }}
            >
              {/* Icon block */}
              <div className="flex-none w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffdcc6]/60 to-[#f5e8da]/40 border border-[#ddc1b0]/40 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#944a00]/45"
                  style={{ fontSize: 22 }}
                >
                  {card.icon}
                </span>
              </div>

              {/* Text block */}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="font-heading font-bold text-[13px] text-on-surface/55 leading-tight truncate">
                  {t[card.titleKey][lang]}
                </span>
                <span className="font-body text-[10px] text-on-surface-variant/60 mt-0.5">
                  {card.days} {lang === 'uz' ? 'kun' : 'дней'}
                </span>
              </div>

              {/* Lock state */}
              <div className="flex-none flex flex-col items-center gap-0.5">
                <span
                  className="material-symbols-outlined text-on-surface-variant/50"
                  style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                <span className="font-heading text-[8px] uppercase tracking-wider font-bold text-on-surface-variant/50">
                  {t.soon[lang]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <p className="absolute bottom-3 left-0 right-0 text-center font-heading text-xs font-semibold px-4 z-10">
        <span className="text-gradient-orange">{t.unlockHint[lang]}</span>
      </p>
    </div>
  )
}
