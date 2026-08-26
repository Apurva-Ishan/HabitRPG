import { LEVEL_THRESHOLDS, MAX_LEVEL, LEVEL_UP_BONUS_XP } from './constants'

// Returns level (1-based) for a given total XP
export function calculateLevel(totalXP: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, MAX_LEVEL)
}

// XP required to reach the next level from current totalXP
export function xpForNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP)
  if (level >= MAX_LEVEL) return 0
  return LEVEL_THRESHOLDS[level] // index = level (0-based level+1)
}

// XP progress within the current level (0–1)
export function levelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP)
  if (level >= MAX_LEVEL) return 1

  const currentLevelXP = LEVEL_THRESHOLDS[level - 1]
  const nextLevelXP = LEVEL_THRESHOLDS[level]
  return (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
}

// XP needed to reach next level from current position
export function xpToNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP)
  if (level >= MAX_LEVEL) return 0
  return LEVEL_THRESHOLDS[level] - totalXP
}

// Returns true if adding xpDelta causes a level-up
export function causesLevelUp(currentXP: number, xpDelta: number): boolean {
  return calculateLevel(currentXP + xpDelta) > calculateLevel(currentXP)
}

export { LEVEL_UP_BONUS_XP }