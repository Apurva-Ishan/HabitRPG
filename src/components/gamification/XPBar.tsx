import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { levelProgress, xpToNextLevel, xpForNextLevel } from '@/lib/gamification'
import { LEVEL_THRESHOLDS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface XPBarProps {
  showLabels?: boolean
  className?: string
}

export function XPBar({ showLabels = true, className }: XPBarProps) {
  const { user } = useUserStore()
  const progress = levelProgress(user.totalXP)
  const toNext = xpToNextLevel(user.totalXP)
  const isMaxLevel = user.level >= LEVEL_THRESHOLDS.length

  // Animate from previous value
  const [displayProgress, setDisplayProgress] = useState(0)
  const prevProgress = useRef(0)

  useEffect(() => {
    // Small delay so CSS transition plays on mount too
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
      prevProgress.current = progress
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className={cn('space-y-1', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Level {user.level}
          </span>
          {isMaxLevel ? (
            <span className="text-yellow-500 font-semibold">MAX LEVEL</span>
          ) : (
            <span>{toNext} XP to Level {user.level + 1}</span>
          )}
        </div>
      )}

      {/* Track */}
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(displayProgress * 100, 100)}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{user.totalXP} XP total</span>
          {!isMaxLevel && (
            <span>{Math.round(progress * 100)}%</span>
          )}
        </div>
      )}
    </div>
  )
}