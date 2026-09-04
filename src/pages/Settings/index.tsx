import { useTransition } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useHabitStore } from "@/stores/useHabitStore";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { buildAIContext } from "@/lib/aiContext";
import { fetchWeeklyReview } from "@/services/aiService";
import { toast } from "sonner";

const AI_CACHE_DURATION = 86_400_000; // 24h in ms

export default function Settings() {
  const { user, updatePreferences } = useUserStore();
  const { habits } = useHabitStore();
  const {
    achievements,
    weeklyReview,
    setWeeklyReview,
    getTodaysQuests,
  } = useGamificationStore();

  const [isPending, startTransition] = useTransition();

  const isCached =
    !!weeklyReview &&
    Date.now() - new Date(weeklyReview.generatedAt).getTime() < AI_CACHE_DURATION;

  function handleGenerateReview() {
    startTransition(async () => {
      const context = buildAIContext(user, habits, achievements, getTodaysQuests());
      const review = await fetchWeeklyReview(context);
      if (!review) {
        toast.error("Failed to generate review. Is the proxy running?");
        return;
      }
      setWeeklyReview(review);
    });
  }

  return (
    <div className="p-6 max-w-2xl space-y-10">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Theme */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <label className="flex max-w-xs flex-col gap-2">
          <span className="font-medium">Theme</span>
          <select
            value={user.preferences.theme}
            onChange={(e) =>
              updatePreferences({ theme: e.target.value as "light" | "dark" | "system" })
            }
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </section>

      {/* Weekly Review */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Weekly Review</h2>
          {isCached && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Cached · refreshes in{" "}
              {Math.ceil(
                (AI_CACHE_DURATION -
                  (Date.now() - new Date(weeklyReview!.generatedAt).getTime())) /
                  3_600_000
              )}
              h
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          AI-generated analysis of your habit performance. Cached for 24 hours.
        </p>

        <button
          onClick={handleGenerateReview}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isPending
            ? "Generating…"
            : isCached
            ? "Regenerate Review"
            : "Generate Review"}
        </button>

        {weeklyReview && (
          <div className="space-y-4 rounded-lg border bg-card p-5">
            {/* Summary */}
            <p className="text-sm leading-relaxed">{weeklyReview.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Strengths */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {weeklyReview.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-0.5 text-green-500">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Areas to Improve
                </h3>
                <ul className="space-y-1">
                  {weeklyReview.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-0.5 text-amber-500">○</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Recommendations
              </h3>
              <ol className="space-y-1">
                {weeklyReview.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-mono text-blue-500">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}