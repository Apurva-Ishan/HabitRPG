import { useMemo } from 'react'
import type { Habit } from '@/types'

interface Props {
  habits: Habit[]
  days?: number
}

function lastNDates(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function getIntensity(count: number, max: number): string {
  if (count === 0) return 'bg-muted'
  const ratio = count / max
  if (ratio <= 0.25) return 'bg-primary/25'
  if (ratio <= 0.5)  return 'bg-primary/50'
  if (ratio <= 0.75) return 'bg-primary/75'
  return 'bg-primary'
}

export function CompletionHeatmap({ habits, days = 90 }: Props) {
  const dates = useMemo(() => lastNDates(days), [days])

  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const date of dates) map[date] = 0
    for (const habit of habits) {
      for (const record of habit.completionHistory) {
        if (record.date in map) map[record.date]++
      }
    }
    return map
  }, [habits, dates])

  const max = useMemo(
    () => Math.max(1, ...Object.values(countsByDate)),
    [countsByDate]
  )

  // Group into weeks (columns of 7)
  const weeks = useMemo(() => {
    const result: string[][] = []
    for (let i = 0; i < dates.length; i += 7) {
      result.push(dates.slice(i, i + 7))
    }
    return result
  }, [dates])

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const count = countsByDate[date] ?? 0
              return (
                <div
                  key={date}
                  title={`${date}: ${count} completion${count !== 1 ? 's' : ''}`}
                  className={`w-3 h-3 rounded-sm ${getIntensity(count, max)}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary'].map((cls) => (
          <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}