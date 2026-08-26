import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Achievement, Quest, AIWeeklyReview } from '@/types'
import { buildInitialAchievements } from '@/lib/achievements'
import { QUEST_XP } from '@/lib/constants'

interface GamificationStore {
  achievements: Achievement[]
  quests: Quest[]
  weeklyReview: AIWeeklyReview | null
  pendingAchievements: string[]   // IDs queued to show as toasts

  // achievements
  unlockAchievement: (id: string) => Achievement | null
  dismissPendingAchievement: (id: string) => void

  // quests
  addQuest: (quest: Omit<Quest, 'id' | 'completed'>) => void
  completeQuest: (id: string) => Quest | null
  clearTodaysQuests: () => void
  getTodaysQuests: () => Quest[]

  // weekly review
  setWeeklyReview: (review: AIWeeklyReview) => void
  clearWeeklyReview: () => void
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      achievements: buildInitialAchievements(),
      quests: [],
      weeklyReview: null,
      pendingAchievements: [],

      unlockAchievement: (id) => {
        const achievement = get().achievements.find((a) => a.id === id)
        if (!achievement || achievement.unlocked) return null

        const unlocked: Achievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        }

        set((s) => ({
          achievements: s.achievements.map((a) => (a.id === id ? unlocked : a)),
          pendingAchievements: [...s.pendingAchievements, id],
        }))

        return unlocked
      },

      dismissPendingAchievement: (id) =>
        set((s) => ({
          pendingAchievements: s.pendingAchievements.filter((pid) => pid !== id),
        })),

      addQuest: (questData) => {
        const quest: Quest = {
          ...questData,
          id: nanoid(),
          completed: false,
          xpReward: questData.xpReward ?? QUEST_XP[questData.difficulty],
        }
        set((s) => ({ quests: [...s.quests, quest] }))
      },

      completeQuest: (id) => {
        const quest = get().quests.find((q) => q.id === id)
        if (!quest || quest.completed) return null

        set((s) => ({
          quests: s.quests.map((q) =>
            q.id === id ? { ...q, completed: true } : q
          ),
        }))

        return { ...quest, completed: true }
      },

      clearTodaysQuests: () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        set((s) => ({
          quests: s.quests.filter((q) => q.date !== todayStr),
        }))
      },

      getTodaysQuests: () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        return get().quests.filter((q) => q.date === todayStr)
      },

      setWeeklyReview: (review) => set({ weeklyReview: review }),
      clearWeeklyReview: () => set({ weeklyReview: null }),
    }),
    { name: 'habitrpg-gamification' }
  )
)