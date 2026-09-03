import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ActivityEvent } from '@/types'

interface Props {
  activityLog: ActivityEvent[]
  weeks?: number
}

function getMondayOf(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day   // Monday = start of week
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function lastNMondays(n: number): string[] {
  const mondays: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i * 7)
    mondays.push(getMondayOf(d))
  }
  return [...new Set(mondays)]   // dedupe if called mid-week
}

export function XPLineChart({ activityLog, weeks = 8 }: Props) {
  const data = useMemo(() => {
    const mondays = lastNMondays(weeks)
    const xpByWeek: Record<string, number> = {}
    for (const monday of mondays) xpByWeek[monday] = 0

    for (const event of activityLog) {
      if (event.type !== 'xp_earned') continue
      const amount = typeof event.metadata.amount === 'number' ? event.metadata.amount : 0
      const monday = getMondayOf(new Date(event.timestamp))
      if (monday in xpByWeek) xpByWeek[monday] += amount
    }

    return mondays.map((monday) => ({
      week: new Date(monday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      xp: xpByWeek[monday],
    }))
  }, [activityLog, weeks])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${value} XP`, 'XP Earned']}
        />
        <Line
          type="monotone"
          dataKey="xp"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          className="stroke-primary"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}