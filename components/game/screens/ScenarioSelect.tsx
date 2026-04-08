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

export default function ScenarioSelect({
  playerName,
  playerLevel,
  playerCoins,
  onSelectScenario,
  lang = 'uz',
}: ScenarioSelectProps) {
  const lockedCards = [
    { emoji: '🏠', titleKey: 'realEstate' as const, w: 'w-[24%]', h: 'h-[68%]', opacity: 'opacity-70', border: 'border-neutral-700' },
    { emoji: '📱', titleKey: 'electronics' as const, w: 'w-[20%]', h: 'h-[60%]', opacity: 'opacity-50', border: 'border-neutral-600' },
    { emoji: '🪑', titleKey: 'furniture' as const, w: 'w-[12%]', h: 'h-[52%]', opacity: 'opacity-35', border: 'border-neutral-800' },
  ]

  return (
    <div className="h-dvh bg-neutral-950 text-white relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#4a90d9] flex items-center justify-center font-bold text-sm">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{playerName}</span>
            <span className="text-xs text-white/50">Lv.{playerLevel}</span>
          </div>
        </div>
        <span className="text-sm font-medium">🪙 {playerCoins}</span>
      </div>

      {/* Carousel */}
      <div className="absolute inset-0 flex items-center gap-3 px-5">
        {/* Active card */}
        <button
          onClick={() => onSelectScenario('car-dealership')}
          className="flex-none w-[38%] max-w-[280px] h-[78%] bg-gradient-to-br from-[#1a2a4a] to-[#0d1b3a] border-2 border-[#4a90d9] rounded-xl relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(74,144,217,0.3)' }}
        >
          {/* Badge */}
          <span className="absolute top-2 right-2 bg-[#22c55e] text-xs px-2 py-0.5 rounded-full font-medium z-10">
            {t.open[lang]}
          </span>

          {/* Card background image */}
          <img
            src="/assets/scenarios/car-dealership/backgrounds/bg_showroom.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          <div className="flex flex-col items-center justify-center h-full px-3 gap-2 relative z-[1]">
            <img
              src="/assets/scenarios/car-dealership/cars/car_all_lineup.webp"
              alt="Chevrolet"
              className="w-24 h-auto drop-shadow-lg"
            />
            <span className="text-[#4a90d9] text-xs uppercase tracking-wider font-medium">
              {t.level[lang]} 1
            </span>
            <span className="text-white font-bold text-center text-sm leading-snug">
              {t.chevrolet[lang]}
            </span>
            <span className="text-neutral-400 text-xs">{t.duration[lang]}</span>
          </div>

          {/* Play button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-[#4a90d9] flex items-center justify-center animate-pulse shadow-lg shadow-[#4a90d9]/40">
              <span className="text-white text-sm ml-0.5">▶</span>
            </div>
          </div>
        </button>

        {/* Locked cards */}
        {lockedCards.map((card) => (
          <div
            key={card.titleKey}
            className={`flex-none ${card.w} ${card.h} ${card.opacity} bg-neutral-900 border ${card.border} rounded-xl relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-2 z-10 rounded-xl">
              <span className="text-2xl grayscale opacity-40">{card.emoji}</span>
              <span className="text-white/30 text-xs text-center px-1">{t[card.titleKey][lang]}</span>
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="text-lg">🔒</span>
                <span className="text-white/50 text-[10px] font-medium">{t.soon[lang]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-[#4a90d9] text-sm font-medium px-4">
        {t.unlockHint[lang]}
      </p>
    </div>
  )
}
