import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Habit } from '@/types'
import { HABIT_CATEGORIES, DIFFICULTIES, DEFAULT_ICONS, XP_REWARDS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// ─── Schema ───────────────────────────────────────────────────────

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Max 60 characters'),
  description: z.string().max(200, 'Max 200 characters').optional().default(''),
  category: z.enum(['health', 'fitness', 'learning', 'mindfulness', 'creativity', 'social', 'custom']),
  frequency: z.enum(['daily', 'weekly']),
  target: z.string().min(1, 'Target is required').max(60, 'Max 60 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  icon: z.string().min(1, 'Icon is required'),
  xpReward: z.coerce.number().min(1).max(200),
})

export type HabitFormValues = z.infer<typeof habitSchema>
type HabitFormInput = z.input<typeof habitSchema>

// ─── Props ────────────────────────────────────────────────────────

interface HabitFormProps {
  defaultValues?: Partial<HabitFormValues>
  onSubmit: (values: HabitFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

// ─── Component ────────────────────────────────────────────────────

export function HabitForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Habit',
}: HabitFormProps) {
  const form = useForm<HabitFormInput, unknown, HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'learning',
      frequency: 'daily',
      target: '',
      difficulty: 'medium',
      icon: DEFAULT_ICONS['learning'],
      xpReward: XP_REWARDS['medium'],
      ...defaultValues,
    },
  })

  function handleCategoryChange(value: Habit['category'] | null) {
    if (!value) return

    const cat = value
    form.setValue('category', cat)
    // Only update icon if user hasn't manually changed it
    const currentIcon = form.getValues('icon')
    const isDefault = Object.values(DEFAULT_ICONS).includes(currentIcon)
    if (isDefault) form.setValue('icon', DEFAULT_ICONS[cat])
  }

  function handleDifficultyChange(value: Habit['difficulty'] | null) {
    if (!value) return

    const diff = value
    form.setValue('difficulty', diff)
    form.setValue('xpReward', XP_REWARDS[diff])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Practice Coding" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What does this habit involve?"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category + Frequency row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={handleCategoryChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HABIT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Target */}
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 45 minutes, 3 times" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Difficulty + XP row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select value={field.value} onValueChange={handleDifficultyChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="xpReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>XP Reward</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    {...field}
                    value={field.value == null ? '' : String(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Icon */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon <span className="text-muted-foreground text-xs">(any emoji)</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. 🏃" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>

      </form>
    </Form>
  )
}