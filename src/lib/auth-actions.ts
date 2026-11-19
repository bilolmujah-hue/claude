"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { createSession, deleteSession } from "./session";

export type AuthState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ism kamida 2 ta harf bo'lsin").max(50),
  email: z.string().trim().toLowerCase().email("Email noto'g'ri"),
  password: z.string().min(8, "Parol kamida 8 belgi bo'lsin").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email noto'g'ri"),
  password: z.string().min(1, "Parolni kiriting"),
});

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "Bu email bilan hisob allaqachon mavjud" };

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email yoki parol noto'g'ri" };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
