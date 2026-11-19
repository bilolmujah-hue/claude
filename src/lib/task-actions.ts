"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { getUserId } from "./session";

export type TaskState = { error?: string; ok?: number } | undefined;

const taskSchema = z.object({
  title: z.string().trim().min(1, "Vazifa nomini kiriting").max(200),
  description: z.string().trim().max(2000).optional().transform((v) => v || null),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(`${v}T00:00:00Z`) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Sana noto'g'ri"),
});

async function authed() {
  const userId = await getUserId();
  if (!userId) throw new Error("Avtorizatsiya talab qilinadi");
  return userId;
}

function read(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
}

export async function createTask(_: TaskState, formData: FormData): Promise<TaskState> {
  const userId = await authed();
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.task.create({ data: { ...parsed.data, userId } });
  revalidatePath("/dashboard");
  return { ok: Date.now() };
}

export async function updateTask(id: string, _: TaskState, formData: FormData): Promise<TaskState> {
  const userId = await authed();
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  // Muddat o'zgarsa, eslatma qaytadan yuborilishi uchun remindedAt tozalanadi
  await db.task.updateMany({ where: { id, userId }, data: { ...parsed.data, remindedAt: null } });
  revalidatePath("/dashboard");
  return { ok: Date.now() };
}

export async function toggleTask(id: string, done: boolean) {
  const userId = await authed();
  await db.task.updateMany({ where: { id, userId }, data: { done } });
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const userId = await authed();
  await db.task.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
}

export async function clearCompleted() {
  const userId = await authed();
  await db.task.deleteMany({ where: { userId, done: true } });
  revalidatePath("/dashboard");
}
