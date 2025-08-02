'use client'

interface ExperienceDisplayProps {
  level: number
  experience: number
  expToNextLevel: number
  levelProgress: number
  maxLevelReached?: boolean
  maxLevel?: number
  className?: string
}

export default function ExperienceDisplay({
  level,
  experience,
  expToNextLevel,
  levelProgress,
  maxLevelReached = false,
  maxLevel,
  className = ''
}: ExperienceDisplayProps) {
  const currentLevelExp = experience - expToNextLevel
  const nextLevelExp = experience + expToNextLevel

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">レベル</span>
        <span className="text-2xl font-bold text-blue-600">
          Lv.{level}
          {maxLevel && ` / ${maxLevel}`}
        </span>
      </div>

      {maxLevelReached ? (
        <div className="text-center py-4">
          <div className="text-lg font-semibold text-yellow-600 mb-2">
            🎉 最大レベル達成！
          </div>
          <div className="text-sm text-gray-600">
            総経験値: {experience.toLocaleString()}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>経験値</span>
              <span>{experience.toLocaleString()} / {nextLevelExp.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              進行度: {(levelProgress * 100).toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">現レベル経験値:</span>
              <div className="font-medium">{currentLevelExp.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-500">次レベルまで:</span>
              <div className="font-medium text-orange-600">{expToNextLevel.toLocaleString()}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}