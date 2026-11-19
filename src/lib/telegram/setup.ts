import "server-only";
import { appUrl, botToken, tg, webhookSecret } from "./api";

/** Webhook, buyruqlar ro'yxati va Menu (Web App) tugmasini o'rnatadi. Idempotent. */
export async function setupTelegram() {
  const url = appUrl();
  if (!botToken() || !url) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN yoki APP_URL yo'q — bot sozlanmadi");
    return false;
  }

  await tg("setWebhook", {
    url: `${url}/api/telegram/webhook`,
    secret_token: webhookSecret(),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });

  await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Boshlash va ilovani ochish" },
      { command: "tasks", description: "Bugungi va muddati o'tgan vazifalar" },
      { command: "help", description: "Yordam" },
    ],
  });

  await tg("setChatMenuButton", {
    menu_button: { type: "web_app", text: "Ilova", web_app: { url: `${url}/tg` } },
  });

  console.log(`[telegram] webhook va Menu tugmasi o'rnatildi → ${url}`);
  return true;
}
