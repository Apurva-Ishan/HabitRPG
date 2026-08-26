// ─── Enums / Unions ───────────────────────────────────────────────

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'learning'
  | 'mindfulness'
  | 'creativity'
  | 'social'
  | 'custom'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Frequency = 'daily' | 'weekly'

export type ActivityEventType =
  | 'habit_complete'
  | 'level_up'
  | 'achievement_unlock'
  | 'quest_complete'
  | 'xp_earned'

// ─── User ─────────────────────────────────────────────────────────

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  preferredDifficulty: Difficulty
  interests: HabitCategory[]
}

export interface User {
  id: string
  name: string
  avatar: string           // emoji or image URL
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  createdAt: string        // ISO date string
  preferences: UserPreferences
}

// ─── Habit ────────────────────────────────────────────────────────

export interface CompletionRecord {
  id: string
  habitId: string
  date: string             // YYYY-MM-DD — idempotency key
  xpEarned: number
  timestamp: string        // ISO datetime
}

export interface Habit {
  id: string
  name: string
  description: string
  category: HabitCategory
  frequency: Frequency
  target: string           // e.g. "45 minutes", "3 times"
  difficulty: Difficulty
  xpReward: number
  icon: string             // emoji
  createdAt: string        // ISO date string
  archived: boolean
  completionHistory: CompletionRecord[]
}

// ─── Achievement ──────────────────────────────────────────────────

export type AchievementConditionType =
  | 'total_completions'    // total habits completed ever
  | 'current_streak'       // current streak >= n
  | 'total_xp'             // total XP >= n
  | 'level_reached'        // level >= n
  | 'category_completions' // completions in a category >= n
  | 'habits_created'       // number of habits created >= n
  | 'quests_completed'     // quests completed >= n

export interface AchievementCondition {
  type: AchievementConditionType
  threshold: number
  category?: HabitCategory // only for category_completions
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string      // ISO date string
  condition: AchievementCondition
}

// ─── Quest ────────────────────────────────────────────────────────

export interface Quest {
  id: string
  title: string
  description: string
  xpReward: number
  difficulty: Difficulty
  date: string             // YYYY-MM-DD
  completed: boolean
  aiGenerated: boolean
  linkedHabitId?: string
}

// ─── Activity Feed ────────────────────────────────────────────────

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  timestamp: string        // ISO datetime
  metadata: Record<string, unknown>
}

// ─── AI ───────────────────────────────────────────────────────────

export interface AIUserContext {
  userName: string
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  activeHabits: {
    name: string
    category: HabitCategory
    difficulty: Difficulty
    target: string
    completionRate7d: number   // 0–1
    currentStreak: number
  }[]
  weeklyStats: {
    totalCompleted: number
    totalPossible: number
    xpEarned: number
  }
  recentActivity: {
    type: ActivityEventType
    timestamp: string
    metadata: Record<string, unknown>
  }[]
  goals: string              // from user preferences interests
}

export interface AIWeeklyReview {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  generatedAt: string        // ISO datetime — used for 24h cache check
}

export interface AIHabitSuggestion {
  name: string
  description: string
  category: HabitCategory
  frequency: Frequency
  target: string
  difficulty: Difficulty
  xpReward: number
  icon: string
}

export interface AIQuestSuggestion {
  title: string
  description: string
  xpReward: number
  difficulty: Difficulty
  linkedHabitId?: string
}

// ─── Storage ──────────────────────────────────────────────────────

export interface AppState {
  user: User
  habits: Habit[]
  achievements: Achievement[]
  quests: Quest[]
  activityLog: ActivityEvent[]
  weeklyReview: AIWeeklyReview | null
}