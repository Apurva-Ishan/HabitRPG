import { useGamificationStore } from '@/stores/useGamificationStore'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Achievements() {
  const { achievements } = useGamificationStore()

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          {unlocked.length} / {achievements.length} unlocked
        </p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Unlocked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unlocked.map((a) => (
              <Card key={a.id} className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-1 flex flex-row items-center gap-3 space-y-0">
                  <span className="text-3xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight">{a.name}</CardTitle>
                    {a.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(a.unlockedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    +{a.xpReward} XP
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Locked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locked.map((a) => (
              <Card key={a.id} className="opacity-50 grayscale">
                <CardHeader className="pb-1 flex flex-row items-center gap-3 space-y-0">
                  <span className="text-3xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight">{a.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    +{a.xpReward} XP
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}