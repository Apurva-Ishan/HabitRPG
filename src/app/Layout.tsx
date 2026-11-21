import { NavLink, Outlet } from "react-router-dom";
import { XPBar } from "@/components/gamification/XPBar";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { useUserStore } from "@/stores/useUserStore";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { useEffect } from "react";
import { toast } from "sonner";
import { useGamificationStore } from "@/stores/useGamificationStore";

const navItems = [
  { to: "/", label: "🏠 Dashboard", end: true },
  { to: "/habits", label: "✅ Habits" },
  { to: "/quests", label: "⚔️ Quests" },
  { to: "/achievements", label: "🏆 Achievements" },
  { to: "/statistics", label: "📊 Statistics" },
  { to: "/ai-coach", label: "🤖 AI Coach" },
  { to: "/settings", label: "⚙️ Settings" },
];

export function Layout() {
  const { user } = useUserStore();

  const { achievements, pendingAchievements, dismissPendingAchievement } =
    useGamificationStore();

  useEffect(() => {
    if (pendingAchievements.length === 0) return;

    pendingAchievements.forEach((id) => {
      const achievement = achievements.find((a) => a.id === id);
      if (!achievement) return;

      toast.success(`${achievement.icon} ${achievement.name}`, {
        description: `Achievement unlocked! +${achievement.xpReward} XP`,
        duration: 5000,
      });

      dismissPendingAchievement(id);
    });
  }, [pendingAchievements, achievements, dismissPendingAchievement]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = user.preferences.theme;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
    };

    applyTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [user.preferences.theme]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r flex flex-col p-4 gap-4 overflow-y-auto">
        <p className="font-bold text-lg mb-1">HabitRPG</p>
        {/* Player card */}
        <div className="flex items-center gap-3 pb-2 border-b">
          <LevelBadge size="md" />
          <div className="min-w-0">
            <p className="font-bold ml-7 truncate">{user.name}</p>
            <StreakBadge showLabel />
          </div>
        </div>

        {/* XP bar */}
        <XPBar showLabels />

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Total XP footer */}
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <p>⚡ {user.totalXP} total XP</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Portal — renders over everything, outside sidebar DOM */}
      <LevelUpModal />
    </div>
  );
}
