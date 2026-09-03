import { useUserStore } from '@/stores/useUserStore'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  className?: string
  showLabel?: boolean
}

export function StreakBadge({ className, showLabel = true }: StreakBadgeProps) {
  const { user } = useUserStore()
  const isActive = user.currentStreak > 0

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('text-lg', !isActive && 'grayscale opacity-50')}>
        🔥
      </span>
      {showLabel && (
        <span
          className={cn(
            'font-semibold text-sm',
            isActive ? 'text-orange-500' : 'text-muted-foreground'
          )}
        >
          {user.currentStreak}
          <span className="font-normal text-muted-foreground"> day streak</span>
        </span>
      )}
    </div>
  )
}