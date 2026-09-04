import type { Habit, User, Achievement, Quest } from '@/types'

export interface AIUserContext {
  user: {
    name: string
    level: number
    totalXP: number
    currentStreak: number
    longestStreak: number
    preferences: {
      preferredDifficulty: string
      interests: string[]
    }
  }
  habits: {
    id: string
    name: string
    category: string
    frequency: string
    difficulty: string
    xpReward: number
    completionRate7d: number   // 0–1
    currentStreak: number
  }[]
  stats: {
    totalHabits: number
    activeHabits: number
    todayCompletionRate: number   // 0–1
    topCategory: string | null
  }
  recentActivity: {
    date: string
    completions: number
  }[]                            // last 7 days, newest first
  achievements: {
    unlocked: number
    total: number
    recent: string[]             // names of last 3 unlocked
  }
  quests: {
    todayTotal: number
    todayCompleted: number
  }
}

function habitCompletionRate7d(habit: Habit): number {
  const today = new Date()
  const dates = new Set<string>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.add(d.toISOString().slice(0, 10))
  }
  const count = habit.completionHistory.filter((r) => dates.has(r.date)).length
  return habit.frequency === 'weekly'
    ? count / 1          // max 1 per week
    : count / 7
}

function habitCurrentStreak(habit: Habit): number {
  // Simple day-walk for context — not the full streak logic from streaks.ts
  const history = new Set(habit.completionHistory.map((r) => r.date))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (history.has(dateStr)) streak++
    else break
  }
  return streak
}

export function buildAIContext(
  user: User,
  habits: Habit[],
  achievements: Achievement[],
  todaysQuests: Quest[]
): AIUserContext {
  const activeHabits = habits.filter((h) => !h.archived)
  const today = new Date().toISOString().slice(0, 10)

  // Today's completion rate
  const completedToday = activeHabits.filter((h) =>
    h.completionHistory.some((r) => r.date === today)
  ).length
  const todayCompletionRate =
    activeHabits.length === 0 ? 0 : completedToday / activeHabits.length

  // Top category by completion count
  const categoryCounts: Record<string, number> = {}
  for (const habit of activeHabits) {
    categoryCounts[habit.category] =
      (categoryCounts[habit.category] ?? 0) + habit.completionHistory.length
  }
  const topCategory =
    Object.keys(categoryCounts).length === 0
      ? null
      : Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]

  // Last 7 days activity
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const completions = activeHabits.filter((h) =>
      h.completionHistory.some((r) => r.date === dateStr)
    ).length
    return { date: dateStr, completions }
  })

  // Recent unlocked achievements (last 3 by unlockedAt)
  const recentAchievements = achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))
    .slice(0, 3)
    .map((a) => a.name)

  return {
    user: {
      name: user.name,
      level: user.level,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      preferences: {
        preferredDifficulty: user.preferences.preferredDifficulty,
        interests: user.preferences.interests,
      },
    },
    habits: activeHabits.map((h) => ({
      id: h.id,
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      difficulty: h.difficulty,
      xpReward: h.xpReward,
      completionRate7d: Math.round(habitCompletionRate7d(h) * 100) / 100,
      currentStreak: habitCurrentStreak(h),
    })),
    stats: {
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
      todayCompletionRate: Math.round(todayCompletionRate * 100) / 100,
      topCategory,
    },
    recentActivity,
    achievements: {
      unlocked: achievements.filter((a) => a.unlocked).length,
      total: achievements.length,
      recent: recentAchievements,
    },
    quests: {
      todayTotal: todaysQuests.length,
      todayCompleted: todaysQuests.filter((q) => q.completed).length,
    },
  }
}