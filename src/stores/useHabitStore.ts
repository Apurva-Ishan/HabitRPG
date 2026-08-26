import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Habit, CompletionRecord, ActivityEvent, ActivityEventType } from '@/types'
import { XP_REWARDS } from '@/lib/constants'
import { today } from '@/lib/streaks'

interface HabitStore {
  habits: Habit[]
  activityLog: ActivityEvent[]

  // habit CRUD
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'completionHistory'>) => string
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id' | 'createdAt' | 'completionHistory'>>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void

  // completion
  completeHabit: (habitId: string) => CompletionRecord | null  // null = already done today
  uncompleteHabit: (habitId: string) => void                   // undo for today

  // activity log
  logEvent: (type: ActivityEventType, metadata: Record<string, unknown>) => void

  // selectors
  getActiveHabits: () => Habit[]
  getHabitById: (id: string) => Habit | undefined
  getTotalCompletions: () => number
  getAllCompletions: () => CompletionRecord[]
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      activityLog: [],

      addHabit: (habitData) => {
        const id = nanoid()
        const habit: Habit = {
          ...habitData,
          id,
          createdAt: new Date().toISOString(),
          archived: false,
          completionHistory: [],
          xpReward: habitData.xpReward ?? XP_REWARDS[habitData.difficulty],
        }
        set((s) => ({ habits: [...s.habits, habit] }))
        return id
      },

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      archiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)),
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      completeHabit: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId)
        if (!habit) return null

        const todayStr = today()
        const alreadyDone = habit.completionHistory.some((r) => r.date === todayStr)
        if (alreadyDone) return null

        const record: CompletionRecord = {
          id: nanoid(),
          habitId,
          date: todayStr,
          xpEarned: habit.xpReward,
          timestamp: new Date().toISOString(),
        }

        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId
              ? { ...h, completionHistory: [...h.completionHistory, record] }
              : h
          ),
        }))

        get().logEvent('habit_complete', {
          habitId,
          habitName: habit.name,
          xpEarned: habit.xpReward,
          date: todayStr,
        })

        return record
      },

      uncompleteHabit: (habitId) => {
        const todayStr = today()
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completionHistory: h.completionHistory.filter((r) => r.date !== todayStr),
                }
              : h
          ),
        }))
      },

      logEvent: (type, metadata) => {
        const event: ActivityEvent = {
          id: nanoid(),
          type,
          timestamp: new Date().toISOString(),
          metadata,
        }
        // Keep last 200 events
        set((s) => ({
          activityLog: [event, ...s.activityLog].slice(0, 200),
        }))
      },

      getActiveHabits: () => get().habits.filter((h) => !h.archived),

      getHabitById: (id) => get().habits.find((h) => h.id === id),

      getTotalCompletions: () =>
        get().habits.reduce((sum, h) => sum + h.completionHistory.length, 0),

      getAllCompletions: () =>
        get().habits.flatMap((h) => h.completionHistory),
    }),
    { name: 'habitrpg-habits' }
  )
)