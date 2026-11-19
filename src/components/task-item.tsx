"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { deleteTask, toggleTask, updateTask, type TaskState } from "@/lib/task-actions";
import { TaskFields } from "./task-fields";

export type TaskDTO = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null; // YYYY-MM-DD
};

const PRIORITY = {
  LOW: { label: "Past", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  MEDIUM: { label: "O'rta", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  HIGH: { label: "Yuqori", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

function dueInfo(due: string, today: string) {
  const [y, m, d] = due.split("-");
  const label = `${d}.${m}.${y}`;
  if (due < today) return { label, cls: "text-rose-500" };
  if (due === today) return { label: "Bugun", cls: "text-amber-500" };
  return { label, cls: "text-muted" };
}

export function TaskItem({ task, today }: { task: TaskDTO; today: string }) {
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useOptimistic(task.done);
  const [deleting, startDelete] = useTransition();
  const [, startToggle] = useTransition();
  const [state, action, pending] = useActionState(async (prev: TaskState, fd: FormData) => {
    const res = await updateTask(task.id, prev, fd);
    if (res?.ok) setEditing(false);
    return res;
  }, undefined);

  if (editing) {
    return (
      <li className="card p-4">
        <form action={action} className="space-y-2">
          <TaskFields
            autoFocus
            d={{ title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate ?? "" }}
          />
          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
          <div className="flex gap-2">
            <button disabled={pending} className="btn-primary flex-1 sm:flex-none">
              {pending ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1 sm:flex-none">
              Bekor qilish
            </button>
          </div>
        </form>
      </li>
    );
  }

  const p = PRIORITY[task.priority];
  const due = task.dueDate ? dueInfo(task.dueDate, today) : null;

  return (
    <li className={`card group flex items-start gap-3 p-4 transition ${deleting ? "opacity-40" : ""}`}>
      <button
        type="button"
        aria-label={done ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
        onClick={() =>
          startToggle(async () => {
            setDone(!done);
            await toggleTask(task.id, !done);
          })
        }
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
          done ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
        }`}
      >
        {done && (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`break-words font-medium ${done ? "text-muted line-through" : ""}`}>{task.title}</p>
        {task.description && <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${p.cls}`}>{p.label}</span>
          {due && (
            <span className={`inline-flex items-center gap-1 ${done ? "text-muted" : due.cls}`}>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              {due.label}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Tahrirlash"
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-background hover:text-foreground"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="O'chirish"
          disabled={deleting}
          onClick={() => {
            if (confirm("Vazifani o'chirasizmi?")) startDelete(() => deleteTask(task.id));
          }}
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-500"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
