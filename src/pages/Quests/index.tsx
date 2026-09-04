import { useState, useTransition } from 'react'
import { useGamificationStore } from '@/stores/useGamificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { useHabitStore } from '@/stores/useHabitStore'
import { buildAIContext } from '@/lib/aiContext'
import { fetchQuestSuggestions, type AIQuestSuggestion } from '@/services/aiService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { QUEST_XP } from '@/lib/constants'

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  hard: 'bg-red-500/15 text-red-700 dark:text-red-400',
}

const TODAY = new Date().toISOString().slice(0, 10)

export default function Quests() {
  const { getTodaysQuests, completeQuest, addQuest } = useGamificationStore()
  const { addXP, user } = useUserStore()
  const { logEvent, habits } = useHabitStore()
  const { achievements } = useGamificationStore()

  const [suggestions, setSuggestions] = useState<AIQuestSuggestion[]>([])
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()

  const quests = getTodaysQuests()
  const pending = quests.filter((q) => !q.completed)
  const done = quests.filter((q) => q.completed)
  const visibleSuggestions = suggestions.filter((_, i) => !dismissed.has(i))

  function handleComplete(id: string) {
    const quest = completeQuest(id)
    if (!quest) return
    const xp = quest.xpReward ?? QUEST_XP[quest.difficulty]
    addXP(xp)
    logEvent('xp_earned', { amount: xp, source: 'quest', questId: id })
    toast.success(`Quest complete! +${xp} XP`)
  }

  function handleGenerate() {
    startTransition(async () => {
      const context = buildAIContext(user, habits, achievements, getTodaysQuests())
      const result = await fetchQuestSuggestions(context)
      if (!result) {
        toast.error('Failed to generate quests. Is the proxy running?')
        return
      }
      setSuggestions(result)
      setDismissed(new Set())
    })
  }

  function handleAccept(s: AIQuestSuggestion, index: number) {
    addQuest({
      title: s.title,
      description: s.description,
      difficulty: s.difficulty,
      xpReward: s.xpReward,
      date: TODAY,
      aiGenerated: true,
    })
    setDismissed((prev) => new Set(prev).add(index))
    toast.success(`Quest added: "${s.title}"`)
  }

  function handleDismiss(index: number) {
    setDismissed((prev) => new Set(prev).add(index))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Quests</h1>
          <p className="text-sm text-muted-foreground">
            {done.length} / {quests.length} completed today
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? 'Generating…' : '✦ AI Quests'}
        </Button>
      </div>

      {/* AI Suggestions */}
      {visibleSuggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested Quests
          </h2>
          {suggestions.map((s, i) =>
            dismissed.has(i) ? null : (
              <Card key={i} className="border-dashed">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[s.difficulty]}`}
                    >
                      {s.difficulty}
                    </span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 mt-0.5">
                    +{s.xpReward} XP
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(s, i)}>
                      Add quest
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDismiss(i)}>
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </section>
      )}

      {quests.length === 0 && visibleSuggestions.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No quests for today. Hit <span className="font-medium">✦ AI Quests</span> to generate some.
        </p>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section className="space-y-3">
          {pending.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">{q.title}</CardTitle>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty]}`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  +{q.xpReward ?? QUEST_XP[q.difficulty]} XP
                </Badge>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-4 pt-0">
                <p className="text-sm text-muted-foreground">{q.description}</p>
                <Button size="sm" className="shrink-0" onClick={() => handleComplete(q.id)}>
                  Complete
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Completed
          </h2>
          {done.map((q) => (
            <Card key={q.id} className="opacity-50">
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base line-through">{q.title}</CardTitle>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty]}`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  +{q.xpReward ?? QUEST_XP[q.difficulty]} XP
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{q.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}