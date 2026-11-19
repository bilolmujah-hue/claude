"use client";

import Script from "next/script";

type ThemeParams = Record<string, string | undefined>;
type WebApp = {
  initData: string;
  colorScheme: "light" | "dark";
  themeParams: ThemeParams;
  ready(): void;
  expand(): void;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  onEvent(e: "themeChanged", cb: () => void): void;
};

export function getWebApp(): WebApp | null {
  const w = (window as unknown as { Telegram?: { WebApp?: WebApp } }).Telegram?.WebApp;
  return w && w.initData ? w : null;
}

/**
 * Telegram mavzusini (light/dark + ranglar) CSS o'zgaruvchilariga o'tkazadi.
 * Xuddi shu mantiq layout'dagi inline skriptda ham bor (sahifa yuklanishidagi miltillashni oldini olish uchun).
 */
export function applyTelegramTheme(p: ThemeParams, scheme: "light" | "dark") {
  const root = document.documentElement;
  const set = (name: string, v?: string) => v && root.style.setProperty(name, v);
  root.classList.add("tg");
  root.classList.toggle("dark", scheme === "dark");
  set("--background", p.secondary_bg_color || p.bg_color);
  set("--card", p.section_bg_color || p.bg_color);
  set("--foreground", p.text_color);
  set("--muted", p.hint_color || p.subtitle_text_color);
  set("--accent", p.button_color);
  set("--accent-foreground", p.button_text_color);
  if (p.text_color) root.style.setProperty("--border", `color-mix(in srgb, ${p.text_color} 12%, transparent)`);
  try {
    sessionStorage.setItem("tgTheme", JSON.stringify({ p, scheme }));
  } catch {}
}

function init() {
  const app = getWebApp();
  if (!app) return;
  const apply = () => {
    applyTelegramTheme(app.themeParams, app.colorScheme);
    const bg = app.themeParams.secondary_bg_color || app.themeParams.bg_color;
    if (bg) {
      try {
        app.setHeaderColor(bg);
        app.setBackgroundColor(bg);
      } catch {}
    }
  };
  apply();
  app.onEvent("themeChanged", apply);
  app.ready();
  app.expand();
}

export function TelegramTheme() {
  return <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" onReady={init} />;
}
