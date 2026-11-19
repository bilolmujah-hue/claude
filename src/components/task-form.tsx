"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/lib/task-actions";
import { TaskFields } from "./task-fields";

export function TaskForm() {
  const [state, action, pending] = useActionState(createTask, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="card space-y-2 p-4">
      <TaskFields />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full sm:w-auto">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {pending ? "Qo'shilmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}
