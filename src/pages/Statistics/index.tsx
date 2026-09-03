import { useHabitStore } from "@/stores/useHabitStore";
import { XPLineChart } from "@/components/statistics/XPLineChart";
import { useUserStore } from "@/stores/useUserStore";
import { CategoryRadarChart } from "@/components/statistics/CategoryRadarChart";

export default function Statistics() {
  const { activityLog, habits } = useHabitStore();
  const activeHabits = habits.filter((h) => !h.archived);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-sm text-muted-foreground">Your progress over time</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Weekly XP Earned
        </h2>
        <div className="rounded-md border p-4">
          <XPLineChart activityLog={activityLog} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Category Completion (30 Days)
        </h2>
        <div className="rounded-md border p-4">
          <CategoryRadarChart habits={activeHabits} />
        </div>
      </section>
    </div>
  );
}
