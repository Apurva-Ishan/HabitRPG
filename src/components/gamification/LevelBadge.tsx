import { useUserStore } from '@/stores/useUserStore'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export function LevelBadge({ className, size = 'md' }: LevelBadgeProps) {
  const { user } = useUserStore()

  return (
    <div
      className={cn(
        'rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center ring-2 ring-primary/30',
        sizes[size],
        className
      )}
      title={`Level ${user.level}`}
    >
      {user.level}
    </div>
  )
}