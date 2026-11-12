'use client'

interface GamificationProps {
  xp: number
  level: number
  achievements: { id: number; title: string; icon: string }[]
}

export function GamificationProfile({ xp, level, achievements }: GamificationProps) {
  // Логика прогресса: например, каждый уровень требует level * 500 XP
  const xpForNextLevel = level * 500
  const currentLevelXp = xp % 500
  const progressPercent = Math.min((currentLevelXp / 500) * 100, 100)

  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700">
            {level}
            <span className="absolute -bottom-1 -right-1 text-xs bg-indigo-600 text-white px-1.5 rounded-full border-2 border-white">
              LVL
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">Твой прогресс</p>
            <p className="text-xs text-zinc-500">{xp} XP всего</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">До {level + 1} уровня</p>
          <p className="text-sm font-medium">{xpForNextLevel - xp} XP</p>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Ачивки */}
      <div>
        <p className="text-xs font-medium text-zinc-600 mb-2">Достижения</p>
        <div className="flex flex-wrap gap-2">
          {achievements.length === 0 && (
            <p className="text-xs text-zinc-400">Пока нет достижений. Учись и заказывай справки!</p>
          )}
          {achievements.map((a) => (
            <div 
              key={a.id} 
              title={a.title}
              className="w-10 h-10 bg-zinc-50 border rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform cursor-help"
            >
              {a.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}