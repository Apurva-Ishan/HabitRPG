import { useState } from 'react'
import type { Habit } from '@/types'
import { HabitCard } from './HabitCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HABIT_CATEGORIES } from '@/lib/constants'

interface HabitListProps {
  habits: Habit[]
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onEdit: (habit: Habit) => void
  onArchive: (id: string) => void
}

export function HabitList({
  habits,
  onComplete,
  onUncomplete,
  onEdit,
  onArchive,
}: HabitListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = habits.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || h.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const pending = filtered.filter((h) => {
    const today = new Date().toISOString().slice(0, 10)
    return !h.completionHistory.some((r) => r.date === today)
  })

  const completed = filtered.filter((h) => {
    const today = new Date().toISOString().slice(0, 10)
    return h.completionHistory.some((r) => r.date === today)
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search habits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            if (value) setCategoryFilter(value)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {HABIT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium">No habits found</p>
          <p className="text-sm">
            {search || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first habit to get started'}
          </p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Pending — {pending.length}
          </p>
          {pending.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onEdit={onEdit}
              onArchive={onArchive}
            />
          ))}
        </div>
      )}

      {/* Completed today */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Completed today — {completed.length}
          </p>
          {completed.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onEdit={onEdit}
              onArchive={onArchive}
            />
          ))}
        </div>
      )}
    </div>
  )
}