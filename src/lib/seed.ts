import { nanoid } from 'nanoid'
import type { Habit, CompletionRecord } from '@/types'
import { toDateString } from './streaks'

// Generate completion history going back N days with a given fill rate
function generateHistory(
  habitId: string,
  xpReward: number,
  days: number,
  fillRate: number // 0–1, probability of completion per day
): CompletionRecord[] {
  const records: CompletionRecord[] = []
  const cursor = new Date()

  for (let i = 0; i < days; i++) {
    if (Math.random() < fillRate) {
      const dateStr = toDateString(cursor)
      records.push({
        id: nanoid(),
        habitId,
        date: dateStr,
        xpEarned: xpReward,
        timestamp: new Date(cursor).toISOString(),
      })
    }
    cursor.setDate(cursor.getDate() - 1)
  }

  return records
}

export function buildSeedHabits(): Habit[] {
  const habits: Omit<Habit, 'completionHistory'>[] = [
    {
      id: nanoid(),
      name: 'Morning Run',
      description: 'Run for 30 minutes to start the day',
      category: 'fitness',
      frequency: 'daily',
      target: '30 minutes',
      difficulty: 'medium',
      xpReward: 20,
      icon: '🏃',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      archived: false,
    },
    {
      id: nanoid(),
      name: 'Read',
      description: 'Read a book or article for at least 20 minutes',
      category: 'learning',
      frequency: 'daily',
      target: '20 minutes',
      difficulty: 'easy',
      xpReward: 10,
      icon: '📖',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      archived: false,
    },
    {
      id: nanoid(),
      name: 'Practice Coding',
      description: 'Work on a project or solve a problem',
      category: 'learning',
      frequency: 'daily',
      target: '45 minutes',
      difficulty: 'hard',
      xpReward: 30,
      icon: '💻',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      archived: false,
    },
    {
      id: nanoid(),
      name: 'Meditate',
      description: 'Mindfulness meditation session',
      category: 'mindfulness',
      frequency: 'daily',
      target: '10 minutes',
      difficulty: 'easy',
      xpReward: 10,
      icon: '🧘',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      archived: false,
    },
    {
      id: nanoid(),
      name: 'Strength Training',
      description: 'Full body workout session',
      category: 'fitness',
      frequency: 'weekly',
      target: '3 times per week',
      difficulty: 'hard',
      xpReward: 30,
      icon: '🏋️',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      archived: false,
    },
  ]

  return habits.map((h) => ({
    ...h,
    completionHistory: generateHistory(
      h.id,
      h.xpReward,
      60,
      h.difficulty === 'easy' ? 0.85 : h.difficulty === 'medium' ? 0.7 : 0.55
    ),
  }))
}