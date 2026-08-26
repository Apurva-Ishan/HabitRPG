import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/habits', label: 'Habits' },
  { to: '/quests', label: 'Quests' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/ai-coach', label: 'AI Coach' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r flex flex-col gap-1 p-4">
        <p className="font-bold text-lg mb-4">HabitRPG</p>
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}