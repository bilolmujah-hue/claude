"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWebApp } from "@/components/telegram-theme";

type Status = "loading" | "outside" | "error";

export function TelegramLogin() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    async function login(initData: string) {
      try {
        const res = await fetch("/api/telegram/auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ initData }),
          credentials: "include",
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `Xato: ${res.status}`);
        }
        // To'liq yuklash: yangi cookie bilan server sahifani qayta render qiladi
        if (!cancelled) window.location.replace("/dashboard");
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setStatus("error");
        }
      }
    }

    // telegram-web-app.js afterInteractive yuklanadi — tayyor bo'lishini kutamiz (~3 s)
    const wait = setInterval(() => {
      const app = getWebApp();
      if (app) {
        clearInterval(wait);
        login(app.initData);
      } else if (++tries > 30) {
        clearInterval(wait);
        if (!cancelled) setStatus("outside");
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(wait);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="size-10 animate-spin rounded-full border-4 border-border border-t-accent" />
        <p className="text-sm text-muted">Telegram orqali kirilmoqda...</p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-sm p-6 text-center">
      <p className="text-4xl">{status === "outside" ? "📱" : "⚠️"}</p>
      <h1 className="mt-3 text-lg font-semibold">
        {status === "outside" ? "Bu sahifa Telegram uchun" : "Kirib bo'lmadi"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {status === "outside"
          ? "Ilovani Telegram botdagi Menu tugmasi orqali oching yoki saytga email bilan kiring."
          : error}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {status === "error" && (
          <button onClick={() => window.location.reload()} className="btn-primary">
            Qayta urinish
          </button>
        )}
        <Link href="/login" className="btn-ghost">
          Email bilan kirish
        </Link>
      </div>
    </div>
  );
}
