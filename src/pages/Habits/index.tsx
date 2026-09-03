import { useState } from "react";
import type { Habit } from "@/types";
import { useHabitStore } from "@/stores/useHabitStore";
import { useHabitActions } from "@/hooks/useHabitActions";
import { HabitList } from "@/components/habits/HabitList";
import { HabitForm, type HabitFormValues } from "@/components/habits/HabitForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; habit: Habit };

export default function Habits() {
  const { habits, addHabit, updateHabit, archiveHabit } = useHabitStore();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const activeHabits = habits.filter((h) => !h.archived);

  function handleCreate(values: HabitFormValues) {
    addHabit(values);
    setModal({ mode: "closed" });
  }

  function handleEdit(values: HabitFormValues) {
    if (modal.mode !== "edit") return;
    updateHabit(modal.habit.id, values);
    setModal({ mode: "closed" });
  }

  const { completeHabit, uncompleteHabit } = useHabitActions();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            {activeHabits.length} active habit
            {activeHabits.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })}>
          + New Habit
        </Button>
      </div>

      {/* List */}
      <HabitList
        habits={activeHabits}
        onComplete={completeHabit}
        onUncomplete={uncompleteHabit}
        onEdit={(habit) => setModal({ mode: "edit", habit })}
        onArchive={archiveHabit}
      />

      {/* Create modal */}
      <Dialog
        open={modal.mode === "create"}
        onOpenChange={(open) => !open && setModal({ mode: "closed" })}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Habit</DialogTitle>
          </DialogHeader>
          <HabitForm
            onSubmit={handleCreate}
            onCancel={() => setModal({ mode: "closed" })}
            submitLabel="Create Habit"
          />
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog
        open={modal.mode === "edit"}
        onOpenChange={(open) => !open && setModal({ mode: "closed" })}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          {modal.mode === "edit" && (
            <HabitForm
              defaultValues={modal.habit}
              onSubmit={handleEdit}
              onCancel={() => setModal({ mode: "closed" })}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
