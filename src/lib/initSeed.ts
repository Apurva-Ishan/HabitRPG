import { useHabitStore } from '@/stores/useHabitStore'
import { useUserStore } from '@/stores/useUserStore'
import { useGamificationStore } from '@/stores/useGamificationStore'
import { buildSeedHabits } from './seed'
import { calculateLevel } from './gamification'
import { calculateOverallStreak } from './streaks'
import { evaluateAchievements } from './achievements'

export function initSeed() {
  const habitStore = useHabitStore.getState()
  const userStore = useUserStore.getState()
  const gamificationStore = useGamificationStore.getState()

  // Only seed if no habits exist yet
  if (habitStore.habits.length > 0) return

  const seededHabits = buildSeedHabits()

  // Manually inject habits into the store
  useHabitStore.setState({ habits: seededHabits })

  // Calculate derived user stats from seed data
  const totalXP = seededHabits.reduce(
    (sum, h) => sum + h.completionHistory.reduce((s, r) => s + r.xpEarned, 0),
    0
  )
  const level = calculateLevel(totalXP)
  const currentStreak = calculateOverallStreak(seededHabits)

  useUserStore.setState({
    user: {
      ...userStore.user,
      totalXP,
      level,
      currentStreak,
      longestStreak: currentStreak + 3,
    },
  })

  // Evaluate and unlock achievements from seed state
  const totalCompletions = seededHabits.reduce(
    (sum, h) => sum + h.completionHistory.length,
    0
  )

  const toUnlock = evaluateAchievements(gamificationStore.achievements, {
    user: { ...userStore.user, totalXP, level, currentStreak },
    habits: seededHabits,
    totalCompletions,
    questsCompleted: 0,
  })

  toUnlock.forEach((id) => {
    const achievement = gamificationStore.achievements.find((a) => a.id === id)
    if (achievement) {
      useGamificationStore.setState((s) => ({
        achievements: s.achievements.map((a) =>
          a.id === id
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a
        ),
      }))
    }
  })

  console.info('[Seed] Seeded habits, XP, level, and achievements.')
}