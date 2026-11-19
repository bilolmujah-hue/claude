"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/lib/auth-actions";

type Props = {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isRegister = mode === "register";

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isRegister ? "Hisob yaratish" : "Xush kelibsiz"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isRegister ? "Bir daqiqada ro'yxatdan o'ting." : "Davom etish uchun hisobingizga kiring."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {isRegister && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Ism</span>
            <input name="name" required minLength={2} autoComplete="name" className="input" placeholder="Ali" />
          </label>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className="input" placeholder="siz@misol.uz" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Parol</span>
          <input
            name="password"
            type="password"
            required
            minLength={isRegister ? 8 : 1}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="input"
            placeholder="••••••••"
          />
        </label>

        {state?.error && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button disabled={pending} className="btn-primary w-full">
          {pending ? "Kuting..." : isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-accent hover:underline">
          {isRegister ? "Kirish" : "Ro'yxatdan o'tish"}
        </Link>
      </p>
    </div>
  );
}
