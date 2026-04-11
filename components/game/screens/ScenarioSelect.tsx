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
  duration: { uz: "5 kun · 7-10 daq", ru: '5 дней · 7-10 мин' },
  unlockHint: { uz: "Avtosalonni o'ting → ko'chmas mulkni oching!", ru: 'Пройди автосалон → открой недвижимость!' },
  realEstate: { uz: "Ko'chmas mulk", ru: 'Недвижимость' },
  electronics: { uz: 'Elektronika', ru: 'Электроника' },
  furniture: { uz: 'Mebel', ru: 'Мебель' },
} as const;

type LockedCard = {
  icon: string;
  titleKey: 'realEstate' | 'electronics' | 'furniture';
};

const lockedCards: LockedCard[] = [
  { icon: 'home', titleKey: 'realEstate' },
  { icon: 'smartphone', titleKey: 'electronics' },
  { icon: 'chair', titleKey: 'furniture' },
];

export default function ScenarioSelect({
  playerName,
  playerLevel,
  playerCoins,
  onSelectScenario,
  lang = 'uz',
}: ScenarioSelectProps) {
  return (
    <div className="h-full w-full mesh-game-dark text-white relative overflow-hidden">
      {/* Background orbs — premium depth */}
      <div
        className="glow-orb"
        style={{
          width: 320,
          height: 320,
          top: -80,
          left: -80,
          background: 'radial-gradient(circle, rgba(232,121,10,0.35) 0%, transparent 70%)',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 260,
          height: 260,
          bottom: -60,
          right: -60,
          background: 'radial-gradient(circle, rgba(148,74,0,0.3) 0%, transparent 70%)',
          animationDelay: '1.2s',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8790a] to-[#944a00] flex items-center justify-center font-heading font-bold text-sm text-white shadow-lg shadow-[#e8790a]/20">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-heading font-semibold text-white">{playerName}</span>
            <span className="text-[10px] font-heading uppercase tracking-widest text-[#ffdcc6]/60">
              Lv.{playerLevel}
            </span>
          </div>
        </div>

        {/* Coin pill — brand orange */}
        <div className="flex items-center gap-1.5 bg-[#e8790a]/10 border border-[#e8790a]/30 rounded-full px-3 py-1 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[#ff9a3c]" style={{ fontSize: 16 }}>
            paid
          </span>
          <span className="font-heading font-bold text-sm text-[#ff9a3c]">{playerCoins}</span>
        </div>
      </div>

      {/* Main row: active card + locked grid */}
      <div className="absolute inset-0 flex items-center gap-3 px-5 pt-14 pb-14">
        {/* === Active card === */}
        <button
          onClick={() => onSelectScenario('car-dealership')}
          className="scenario-active-card flex-none w-[38%] max-w-[300px] h-[86%] relative overflow-hidden animate-pulse-glow group"
        >
          {/* Badge "OCHIQ / ОТКРЫТ" — green with shimmer sweep */}
          <span className="badge-shimmer absolute top-2.5 right-2.5 bg-[#22c55e] text-[10px] px-2.5 py-0.5 rounded-full font-heading font-bold uppercase tracking-wider text-white z-20 shadow-md shadow-[#22c55e]/30">
            {t.open[lang]}
          </span>

          {/* Background image */}
          <img
            src="/assets/scenarios/car-dealership/backgrounds/bg_showroom.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
          />

          {/* Warm orange wash */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(232,121,10,0.18) 0%, transparent 60%)',
            }}
          />

          <div className="flex flex-col items-center justify-center h-full px-3 gap-2 relative z-[2]">
            <img
              src="/assets/scenarios/car-dealership/cars/car_all_lineup.webp"
              alt="Chevrolet"
              className="w-28 h-auto transition-transform duration-500 group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 24px rgba(232,121,10,0.45))' }}
            />
            <span className="font-heading text-[#ff9a3c] text-[10px] uppercase tracking-[0.25em] font-semibold mt-1">
              {t.level[lang]} 1
            </span>
            <span className="font-heading text-white font-bold text-center text-base leading-tight">
              {t.chevrolet[lang]}
            </span>
            <span className="text-[#ffdcc6]/60 text-[11px] font-body">{t.duration[lang]}</span>
          </div>

          {/* Play button — uses brand cta-btn gradient */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="cta-btn w-12 h-12 rounded-full flex items-center justify-center">
              <span className="text-white text-base ml-0.5 font-bold">▶</span>
            </div>
          </div>
        </button>

        {/* === Locked cards — uniform grid === */}
        <div className="grid grid-cols-3 gap-3 flex-1 h-[78%]">
          {lockedCards.map((card) => (
            <div
              key={card.titleKey}
              aria-disabled="true"
              className="glass-card-dark rounded-xl relative overflow-hidden flex flex-col items-center justify-center gap-2 px-2"
            >
              <span
                className="material-symbols-outlined text-[#ffdcc6]/25"
                style={{ fontSize: 36 }}
              >
                {card.icon}
              </span>
              <span className="font-heading text-white/40 text-[11px] text-center leading-tight font-semibold">
                {t[card.titleKey][lang]}
              </span>
              <div className="flex flex-col items-center gap-1 mt-1">
                <span
                  className="material-symbols-outlined text-[#ffdcc6]/30"
                  style={{ fontSize: 18 }}
                >
                  lock
                </span>
                <span className="font-heading text-[#ffdcc6]/40 text-[9px] uppercase tracking-widest font-semibold">
                  {t.soon[lang]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint — brand gradient */}
      <p className="absolute bottom-4 left-0 right-0 text-center font-heading text-sm font-semibold px-4 z-10">
        <span className="text-gradient-orange">{t.unlockHint[lang]}</span>
      </p>
    </div>
  )
}
