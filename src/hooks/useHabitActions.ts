import { useCallback } from 'react'
import { toast } from 'sonner'
import { useHabitStore } from '@/stores/useHabitStore'
import { useUserStore } from '@/stores/useUserStore'
import { useGamificationStore } from '@/stores/useGamificationStore'
import { calculateOverallStreak } from '@/lib/streaks'
import { evaluateAchievements } from '@/lib/achievements'
import { ACHIEVEMENT_BONUS_XP } from '@/lib/constants'

export function useHabitActions() {
  const habitStore = useHabitStore()
  const { user, addXP, updateStreak } = useUserStore()
  const { achievements, unlockAchievement } = useGamificationStore()

  const completeHabit = useCallback(
    (habitId: string) => {
      // 1. Mark completion + idempotency check
      const record = habitStore.completeHabit(habitId)
      if (!record) {
        toast.info('Already completed today')
        return
      }

      // 2. Award XP
      addXP(record.xpEarned)
      toast.success(`+${record.xpEarned} XP`, {
        description: `Habit complete!`,
        duration: 2000,
      })

      // 3. Recalculate streak from updated habits
      const updatedHabits = useHabitStore.getState().habits
      const currentStreak = calculateOverallStreak(updatedHabits)
      const longest = useUserStore.getState().user.longestStreak
      updateStreak(currentStreak, longest)

      // 4. Evaluate achievements
      const totalCompletions = useHabitStore.getState().getTotalCompletions()
      const updatedUser = useUserStore.getState().user
      const questsCompleted = useGamificationStore
        .getState()
        .quests.filter((q) => q.completed).length

      const toUnlock = evaluateAchievements(achievements, {
        user: updatedUser,
        habits: updatedHabits,
        totalCompletions,
        questsCompleted,
      })

      // 5. Unlock achievements + award bonus XP + show toasts
      toUnlock.forEach((id) => {
        const unlocked = unlockAchievement(id)
        if (unlocked) {
          addXP(ACHIEVEMENT_BONUS_XP)
          habitStore.logEvent('achievement_unlock', {
            achievementId: id,
            achievementName: unlocked.name,
          })
          toast.success(`🏆 Achievement Unlocked!`, {
            description: `${unlocked.icon} ${unlocked.name} — +${ACHIEVEMENT_BONUS_XP} XP`,
            duration: 4000,
          })
        }
      })

      // 6. Log XP event
      habitStore.logEvent('xp_earned', {
        amount: record.xpEarned,
        source: 'habit',
        habitId,
      })
    },
    [habitStore, user, addXP, updateStreak, achievements, unlockAchievement]
  )

  const uncompleteHabit = useCallback(
    (habitId: string) => {
      const habit = habitStore.getHabitById(habitId)
      if (!habit) return

      habitStore.uncompleteHabit(habitId)

      // Subtract XP — simple approach, floor at 0
      const newXP = Math.max(0, user.totalXP - habit.xpReward)
      useUserStore.setState((s) => ({
        user: {
          ...s.user,
          totalXP: newXP,
        },
      }))

      // Recalculate streak
      const updatedHabits = useHabitStore.getState().habits
      const currentStreak = calculateOverallStreak(updatedHabits)
      updateStreak(currentStreak, user.longestStreak)

      toast.info('Habit unmarked')
    },
    [habitStore, user, updateStreak]
  )

  return { completeHabit, uncompleteHabit }
}