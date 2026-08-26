import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { User, UserPreferences } from '@/types'
import { calculateLevel, causesLevelUp, LEVEL_UP_BONUS_XP } from '@/lib/gamification'
import { ACHIEVEMENTS_DEFINITIONS } from '@/lib/constants'

interface UserStore {
  user: User
  levelUpPending: boolean          // triggers LevelUpModal
  newLevel: number | null

  // actions
  updateProfile: (patch: Partial<Pick<User, 'name' | 'avatar'>>) => void
  updatePreferences: (patch: Partial<UserPreferences>) => void
  addXP: (amount: number) => void
  updateStreak: (current: number, longest: number) => void
  clearLevelUp: () => void
}

const DEFAULT_USER: User = {
  id: nanoid(),
  name: 'Hero',
  avatar: '🧙',
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  createdAt: new Date().toISOString(),
  preferences: {
    theme: 'system',
    preferredDifficulty: 'medium',
    interests: ['learning', 'fitness'],
  },
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      levelUpPending: false,
      newLevel: null,

      updateProfile: (patch) =>
        set((s) => ({ user: { ...s.user, ...patch } })),

      updatePreferences: (patch) =>
        set((s) => ({
          user: {
            ...s.user,
            preferences: { ...s.user.preferences, ...patch },
          },
        })),

      addXP: (amount) => {
        const { user } = get()
        const didLevelUp = causesLevelUp(user.totalXP, amount)
        const newTotalXP = user.totalXP + amount
        const newLevel = calculateLevel(newTotalXP)

        // If level up, add bonus XP on top
        const finalXP = didLevelUp ? newTotalXP + LEVEL_UP_BONUS_XP : newTotalXP

        set((s) => ({
          user: { ...s.user, totalXP: finalXP, level: newLevel },
          levelUpPending: didLevelUp,
          newLevel: didLevelUp ? newLevel : null,
        }))
      },

      updateStreak: (current, longest) =>
        set((s) => ({
          user: {
            ...s.user,
            currentStreak: current,
            longestStreak: Math.max(longest, current),
          },
        })),

      clearLevelUp: () => set({ levelUpPending: false, newLevel: null }),
    }),
    { name: 'habitrpg-user' }
  )
)