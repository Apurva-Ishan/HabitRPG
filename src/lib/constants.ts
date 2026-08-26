import type { Achievement, Difficulty, HabitCategory } from '@/types'

// ─── XP per difficulty ────────────────────────────────────────────

export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

// ─── Level thresholds ─────────────────────────────────────────────
// Index = level, value = total XP required to reach that level

export const LEVEL_THRESHOLDS: number[] = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  450,  // Level 4
  700,  // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10450,// Level 20
]

export const MAX_LEVEL = LEVEL_THRESHOLDS.length

// ─── Categories ───────────────────────────────────────────────────

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'health',      label: 'Health',      emoji: '🏥' },
  { value: 'fitness',     label: 'Fitness',     emoji: '💪' },
  { value: 'learning',    label: 'Learning',    emoji: '📚' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'creativity',  label: 'Creativity',  emoji: '🎨' },
  { value: 'social',      label: 'Social',      emoji: '🤝' },
  { value: 'custom',      label: 'Custom',      emoji: '⭐' },
]

// ─── Difficulties ─────────────────────────────────────────────────

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy',   label: 'Easy',   color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'hard',   label: 'Hard',   color: 'text-red-500' },
]

// ─── Default habit icons by category ─────────────────────────────

export const DEFAULT_ICONS: Record<HabitCategory, string> = {
  health:      '🏥',
  fitness:     '🏃',
  learning:    '📖',
  mindfulness: '🧘',
  creativity:  '🎨',
  social:      '💬',
  custom:      '⭐',
}

// ─── Quest XP range ───────────────────────────────────────────────

export const QUEST_XP: Record<Difficulty, number> = {
  easy:   15,
  medium: 25,
  hard:   40,
}

// ─── Achievement bonus XP ─────────────────────────────────────────

export const ACHIEVEMENT_BONUS_XP = 50

// ─── Level-up bonus XP ────────────────────────────────────────────

export const LEVEL_UP_BONUS_XP = 100

// ─── Streak milestones (days) ─────────────────────────────────────

export const STREAK_MILESTONES = [3, 7, 14, 30, 100]

// ─── AI cache duration ────────────────────────────────────────────

export const AI_WEEKLY_REVIEW_CACHE_MS = 24 * 60 * 60 * 1000 // 24 hours

// ─── Predefined achievements ──────────────────────────────────────

export const ACHIEVEMENTS_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit.',
    icon: '👣',
    xpReward: 50,
    condition: { type: 'total_completions', threshold: 1 },
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 10 habits.',
    icon: '🌱',
    xpReward: 50,
    condition: { type: 'total_completions', threshold: 10 },
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 habits.',
    icon: '🎯',
    xpReward: 100,
    condition: { type: 'total_completions', threshold: 50 },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 habits.',
    icon: '💯',
    xpReward: 150,
    condition: { type: 'total_completions', threshold: 100 },
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Maintain a 7-day streak.',
    icon: '🔥',
    xpReward: 100,
    condition: { type: 'current_streak', threshold: 7 },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak.',
    icon: '⚡',
    xpReward: 200,
    condition: { type: 'current_streak', threshold: 30 },
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Maintain a 100-day streak.',
    icon: '👑',
    xpReward: 500,
    condition: { type: 'current_streak', threshold: 100 },
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 20 learning habits.',
    icon: '🎓',
    xpReward: 100,
    condition: { type: 'category_completions', threshold: 20, category: 'learning' },
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Complete 20 fitness habits.',
    icon: '🏋️',
    xpReward: 100,
    condition: { type: 'category_completions', threshold: 20, category: 'fitness' },
  },
  {
    id: 'level_5',
    name: 'Rising Hero',
    description: 'Reach Level 5.',
    icon: '🌟',
    xpReward: 100,
    condition: { type: 'level_reached', threshold: 5 },
  },
  {
    id: 'level_10',
    name: 'Veteran',
    description: 'Reach Level 10.',
    icon: '🏆',
    xpReward: 200,
    condition: { type: 'level_reached', threshold: 10 },
  },
  {
    id: 'level_20',
    name: 'Grandmaster',
    description: 'Reach Level 20.',
    icon: '💎',
    xpReward: 500,
    condition: { type: 'level_reached', threshold: 20 },
  },
  {
    id: 'habit_collector',
    name: 'Habit Collector',
    description: 'Create 5 habits.',
    icon: '📋',
    xpReward: 50,
    condition: { type: 'habits_created', threshold: 5 },
  },
  {
    id: 'xp_1000',
    name: 'XP Hunter',
    description: 'Earn 1000 total XP.',
    icon: '💰',
    xpReward: 100,
    condition: { type: 'total_xp', threshold: 1000 },
  },
]