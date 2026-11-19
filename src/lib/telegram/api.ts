import "server-only";
import { createHmac } from "node:crypto";

/** Token faqat process.env'dan o'qiladi va hech qachon log qilinmaydi. */
export function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

export function appUrl(): string | null {
  const url = process.env.APP_URL?.trim().replace(/\/+$/, "");
  return url || null;
}

/** Webhook secret_token: AUTH_SECRET'dan hosil qilinadi, alohida env shart emas. */
export function webhookSecret(): string {
  const base = process.env.AUTH_SECRET;
  if (!base) throw new Error("AUTH_SECRET o'rnatilmagan");
  return createHmac("sha256", base).update("telegram-webhook").digest("hex");
}

type TgResponse<T> = { ok: true; result: T } | { ok: false; description?: string; error_code?: number };

export async function tg<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const token = botToken();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN o'rnatilmagan");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => ({ ok: false, description: `HTTP ${res.status}` }))) as TgResponse<T>;
  if (!data.ok) throw new Error(`Telegram ${method} xatosi: ${data.description ?? "noma'lum"}`);
  return data.result;
}

let usernamePromise: Promise<string> | null = null;
export function botUsername(): Promise<string> {
  usernamePromise ??= tg<{ username: string }>("getMe")
    .then((me) => me.username)
    .catch((e) => {
      usernamePromise = null;
      throw e;
    });
  return usernamePromise;
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function webAppButton(text = "📱 Ilovani ochish") {
  const url = appUrl();
  return url ? { inline_keyboard: [[{ text, web_app: { url: `${url}/tg` } }]] } : undefined;
}
