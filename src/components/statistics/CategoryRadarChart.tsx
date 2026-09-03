import { useMemo } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Habit } from '@/types'

interface Props {
  habits: Habit[]
  days?: number
}

function lastNDates(n: number): Set<string> {
  const dates = new Set<string>()
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.add(d.toISOString().slice(0, 10))
  }
  return dates
}

export function CategoryRadarChart({ habits, days = 30 }: Props) {
  const data = useMemo(() => {
    const window = lastNDates(days)

    // per-category: count possible completions and actual completions
    const totals: Record<string, { possible: number; actual: number }> = {}

    for (const habit of habits) {
      if (!totals[habit.category]) totals[habit.category] = { possible: 0, actual: 0 }

      const entry = totals[habit.category]

      // possible = days in window where this habit was due
      // for simplicity: daily habits = all days, weekly habits = days ÷ 7 (floored)
      const possible =
        habit.frequency === 'weekly' ? Math.floor(days / 7) : days
      entry.possible += possible

      // actual = completions whose date falls in window
      const actual = habit.completionHistory.filter((r) => window.has(r.date)).length
      entry.actual += actual
    }

    return Object.entries(totals).map(([category, { possible, actual }]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      rate: possible === 0 ? 0 : Math.round((actual / possible) * 100),
    }))
  }, [habits, days])

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No habit data yet.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Completion rate']}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Radar
          dataKey="rate"
          strokeWidth={2}
          fillOpacity={0.25}
          className="stroke-primary fill-primary"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}