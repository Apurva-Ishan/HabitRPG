import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useUserStore } from '@/stores/useUserStore'
import { LEVEL_UP_BONUS_XP } from '@/lib/gamification'
import { Button } from '@/components/ui/button'

export function LevelUpModal() {
  const { levelUpPending, newLevel, clearLevelUp } = useUserStore()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Auto-focus dismiss button for keyboard accessibility
  useEffect(() => {
    if (levelUpPending) {
      // rAF ensures the portal has painted before focus
      const id = requestAnimationFrame(() => buttonRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [levelUpPending])

  // Close on Escape
  useEffect(() => {
    if (!levelUpPending) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearLevelUp()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [levelUpPending, clearLevelUp])

  if (!levelUpPending || newLevel === null) return null

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={clearLevelUp}
      />

      {/* Panel */}
      <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border bg-card p-10 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <div className="text-6xl select-none">⬆️</div>
        <h2 id="levelup-title" className="text-3xl font-bold tracking-tight">
          Level Up!
        </h2>
        <p className="text-5xl font-extrabold text-primary">
          Level {newLevel}
        </p>
        <p className="text-sm text-muted-foreground">
          +{LEVEL_UP_BONUS_XP} bonus XP awarded
        </p>
        <Button ref={buttonRef} size="lg" className="mt-2 w-full" onClick={clearLevelUp}>
          Let's go! 🎉
        </Button>
      </div>
    </div>,
    document.body
  )
}