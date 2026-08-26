import type { Achievement, AchievementCondition, Habit, User } from '@/types'
import { ACHIEVEMENTS_DEFINITIONS } from './constants'

interface EvalContext {
  user: User
  habits: Habit[]
  totalCompletions: number
  questsCompleted: number
}

function evaluateCondition(condition: AchievementCondition, ctx: EvalContext): boolean {
  switch (condition.type) {
    case 'total_completions':
      return ctx.totalCompletions >= condition.threshold

    case 'current_streak':
      return ctx.user.currentStreak >= condition.threshold

    case 'total_xp':
      return ctx.user.totalXP >= condition.threshold

    case 'level_reached':
      return ctx.user.level >= condition.threshold

    case 'habits_created':
      return ctx.habits.filter((h) => !h.archived).length >= condition.threshold

    case 'quests_completed':
      return ctx.questsCompleted >= condition.threshold

    case 'category_completions': {
      const categoryHabits = ctx.habits.filter(
        (h) => h.category === condition.category
      )
      const count = categoryHabits.reduce(
        (sum, h) => sum + h.completionHistory.length,
        0
      )
      return count >= condition.threshold
    }

    default:
      return false
  }
}

// Returns IDs of achievements that should unlock given current state
// Only returns ones not already unlocked
export function evaluateAchievements(
  achievements: Achievement[],
  ctx: EvalContext
): string[] {
  return achievements
    .filter((a) => !a.unlocked && evaluateCondition(a.condition, ctx))
    .map((a) => a.id)
}

// Build initial achievements array from definitions
export function buildInitialAchievements(): Achievement[] {
  return ACHIEVEMENTS_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: false,
  }))
}