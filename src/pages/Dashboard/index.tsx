import { useUserStore } from "@/stores/useUserStore";
import { useHabitStore } from "@/stores/useHabitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayCompletionRate } from "@/lib/streaks";
import { levelProgress, xpToNextLevel } from "@/lib/gamification";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompletionHeatmap } from "@/components/habits/CompletionHeatmap";

export default function Dashboard() {
  const { user } = useUserStore();
  const { habits } = useHabitStore();

  const activeHabits = habits.filter((h) => !h.archived);
  const completionRate = todayCompletionRate(activeHabits);
  const completedToday = activeHabits.filter((h) =>
    h.completionHistory.some(
      (r) => r.date === new Date().toISOString().slice(0, 10),
    ),
  ).length;

  const progress = levelProgress(user.totalXP); // 0–1
  const xpNeeded = xpToNextLevel(user.totalXP);

  const cards = [
    {
      label: "Level",
      value: user.level,
      sub: `${Math.round(progress * 100)}% to next level`,
    },
    {
      label: "Current Streak",
      value: `${user.currentStreak}d`,
      sub: `Longest: ${user.longestStreak}d`,
    },
    {
      label: "Today's Habits",
      value: `${completedToday} / ${activeHabits.length}`,
      sub: `${Math.round(completionRate * 100)}% complete`,
    },
    {
      label: "Total XP",
      value: user.totalXP.toLocaleString(),
      sub:
        xpNeeded === null
          ? "Max level reached"
          : `${xpNeeded} XP to next level`,
    },
  ];

  const { activityLog } = useHabitStore();

  const EVENT_META: Record<
    string,
    { icon: string; label: (m: Record<string, unknown>) => string }
  > = {
    xp_earned: {
      icon: "⚡",
      label: (m) => `+${m.amount} XP from ${m.source}`,
    },
    habit_completed: {
      icon: "✅",
      label: (m) => `Completed habit`,
    },
    habit_uncompleted: {
      icon: "↩️",
      label: (m) => `Unmarked habit`,
    },
    achievement_unlocked: {
      icon: "🏆",
      label: (m) => `Achievement unlocked`,
    },
    level_up: {
      icon: "⬆️",
      label: (m) => `Reached level ${m.level}`,
    },
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name} {user.avatar}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map(({ label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activityLog.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Activity
          </h2>
          <ScrollArea className="h-72 rounded-md border">
            <div className="p-4 space-y-3">
              {activityLog.map((event) => {
                const meta = EVENT_META[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="text-base leading-tight mt-0.5">
                      {meta?.icon ?? "📌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="leading-tight">
                        {meta?.label(event.metadata) ?? event.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          90-Day Completion
        </h2>
        <div className="rounded-md border p-4 overflow-x-auto">
          <CompletionHeatmap habits={activeHabits} />
        </div>
      </section>
    </div>
  );
}
