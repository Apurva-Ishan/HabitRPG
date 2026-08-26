import type { CompletionRecord, Habit } from '@/types'

// YYYY-MM-DD string for any Date
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function today(): string {
  return toDateString(new Date())
}

export function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

// Check if a habit was completed on a specific date
export function wasCompletedOn(habit: Habit, date: string): boolean {
  return habit.completionHistory.some((r) => r.date === date)
}

// Check if already completed today — idempotency guard
export function isCompletedToday(habit: Habit): boolean {
  return wasCompletedOn(habit, today())
}

// Calculate current streak for a single habit
// Walks backwards from today, counts consecutive completed days
export function calculateHabitStreak(habit: Habit): number {
  if (habit.completionHistory.length === 0) return 0

  const completedDates = new Set(habit.completionHistory.map((r) => r.date))

  let streak = 0
  const cursor = new Date()

  // If not completed today, start checking from yesterday
  if (!completedDates.has(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (completedDates.has(toDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// Calculate overall user streak across ALL active habits
// A day counts if ALL active daily habits were completed that day
export function calculateOverallStreak(habits: Habit[]): number {
  const dailyHabits = habits.filter((h) => !h.archived && h.frequency === 'daily')
  if (dailyHabits.length === 0) return 0

  let streak = 0
  const cursor = new Date()

  // If today isn't fully complete yet, start from yesterday
  const todayStr = toDateString(cursor)
  const todayComplete = dailyHabits.every((h) => wasCompletedOn(h, todayStr))
  if (!todayComplete) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const dateStr = toDateString(cursor)
    const allComplete = dailyHabits.every((h) => wasCompletedOn(h, dateStr))
    if (!allComplete) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// Completion rate for a habit over the last N days
export function completionRateLastNDays(habit: Habit, n: number): number {
  const completedDates = new Set(habit.completionHistory.map((r) => r.date))
  let count = 0
  const cursor = new Date()

  for (let i = 0; i < n; i++) {
    if (completedDates.has(toDateString(cursor))) count++
    cursor.setDate(cursor.getDate() - 1)
  }

  return count / n
}

// Returns array of last N date strings (newest first)
export function lastNDates(n: number): string[] {
  const dates: string[] = []
  const cursor = new Date()
  for (let i = 0; i < n; i++) {
    dates.push(toDateString(cursor))
    cursor.setDate(cursor.getDate() - 1)
  }
  return dates
}

// XP earned in the last 7 days from completion records
export function xpEarnedLastNDays(records: CompletionRecord[], n: number): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - n)
  return records
    .filter((r) => new Date(r.timestamp) >= cutoff)
    .reduce((sum, r) => sum + r.xpEarned, 0)
}