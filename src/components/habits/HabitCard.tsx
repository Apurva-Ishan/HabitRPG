import { useState } from 'react'
import type { Habit } from '@/types'
import { isCompletedToday, calculateHabitStreak } from '@/lib/streaks'
import { DIFFICULTIES, HABIT_CATEGORIES } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  habit: Habit
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onEdit: (habit: Habit) => void
  onArchive: (id: string) => void
}

export function HabitCard({
  habit,
  onComplete,
  onUncomplete,
  onEdit,
  onArchive,
}: HabitCardProps) {
  const [showActions, setShowActions] = useState(false)
  const completed = isCompletedToday(habit)
  const streak = calculateHabitStreak(habit)
  const difficulty = DIFFICULTIES.find((d) => d.value === habit.difficulty)
  const category = HABIT_CATEGORIES.find((c) => c.value === habit.category)

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200 border',
        completed && 'opacity-70 bg-muted/40'
      )}
    >
      <div className="flex items-start gap-3">

        {/* Complete toggle */}
        <button
          onClick={() => completed ? onUncomplete(habit.id) : onComplete(habit.id)}
          className={cn(
            'mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
            completed
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground hover:border-primary'
          )}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{habit.icon}</span>
            <span className={cn('font-semibold truncate', completed && 'line-through text-muted-foreground')}>
              {habit.name}
            </span>
            <Badge variant="outline" className={cn('text-xs', difficulty?.color)}>
              {difficulty?.label}
            </Badge>
          </div>

          {habit.description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {habit.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            <span>{category?.emoji} {category?.label}</span>
            <span>🎯 {habit.target}</span>
            <span>⚡ {habit.xpReward} XP</span>
            {streak > 0 && (
              <span className="text-orange-500 font-medium">🔥 {streak} day streak</span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowActions((v) => !v)}
            aria-label="Habit options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </Button>

          {showActions && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-popover border rounded-md shadow-md min-w-[120px] py-1">
                <button
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => { onEdit(habit); setShowActions(false) }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted text-destructive transition-colors"
                  onClick={() => { onArchive(habit.id); setShowActions(false) }}
                >
                  Archive
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </Card>
  )
}