'use client'

interface ScenarioSelectProps {
  playerName: string
  playerLevel: number
  playerCoins: number
  onSelectScenario: (scenarioId: string) => void
}

const lockedCards = [
  { emoji: '🏠', title: 'Недвижимость', w: 'w-[24%]', h: 'h-[68%]', opacity: 'opacity-70', border: 'border-neutral-700', overlay: 'bg-black/80' },
  { emoji: '📱', title: 'Электроника', w: 'w-[20%]', h: 'h-[60%]', opacity: 'opacity-50', border: 'border-neutral-600', overlay: 'bg-black/80' },
  { emoji: '🪑', title: 'Мебель', w: 'w-[12%]', h: 'h-[52%]', opacity: 'opacity-35', border: 'border-neutral-800', overlay: 'bg-black/85' },
]

export default function ScenarioSelect({
  playerName,
  playerLevel,
  playerCoins,
  onSelectScenario,
}: ScenarioSelectProps) {
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
            ОТКРЫТ
          </span>

          <div className="flex flex-col items-center justify-center h-full px-3 gap-2">
            <span className="text-5xl">🚗</span>
            <span className="text-[#4a90d9] text-xs uppercase tracking-wider font-medium">
              Уровень 1
            </span>
            <span className="text-white font-bold text-center text-sm leading-snug">
              Автосалон Chevrolet
            </span>
            <span className="text-neutral-400 text-xs">5 дней · 7-10 мин</span>
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
            key={card.title}
            className={`flex-none ${card.w} ${card.h} ${card.opacity} bg-neutral-900 border ${card.border} rounded-xl relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-2 z-10 rounded-xl">
              <span className="text-2xl grayscale opacity-40">{card.emoji}</span>
              <span className="text-white/30 text-xs text-center px-1">{card.title}</span>
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="text-lg">🔒</span>
                <span className="text-white/50 text-[10px] font-medium">Скоро</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-[#4a90d9] text-sm font-medium px-4">
        Пройди автосалон → открой недвижимость!
      </p>
    </div>
  )
}
