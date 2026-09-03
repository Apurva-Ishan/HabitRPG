import { useGamificationStore } from '@/stores/useGamificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { useHabitStore } from '@/stores/useHabitStore'
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

export default function Quests() {
  const { getTodaysQuests, completeQuest } = useGamificationStore()
  const { addXP } = useUserStore()
  const { logEvent } = useHabitStore()

  const quests = getTodaysQuests()
  const pending = quests.filter((q) => !q.completed)
  const done = quests.filter((q) => q.completed)

  function handleComplete(id: string) {
    const quest = completeQuest(id)
    if (!quest) return

    const xp = quest.xpReward ?? QUEST_XP[quest.difficulty]
    addXP(xp)
    logEvent('xp_earned', { amount: xp, source: 'quest', questId: id })
    toast.success(`Quest complete! +${xp} XP`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Quests</h1>
        <p className="text-sm text-muted-foreground">
          {done.length} / {quests.length} completed today
        </p>
      </div>

      {quests.length === 0 && (
        <p className="text-muted-foreground text-sm">No quests for today.</p>
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