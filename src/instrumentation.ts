export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const { setupTelegram } = await import("./lib/telegram/setup");
  const { sendDueReminders } = await import("./lib/telegram/reminders");

  // Server ishga tushishini kutdirmaslik uchun fonda bajariladi
  setupTelegram().catch((e) => console.error("[telegram] sozlashda xato:", (e as Error).message));

  const tick = () =>
    sendDueReminders()
      .then((r) => r.sent && console.log(`[reminders] ${r.sent} ta eslatma yuborildi`))
      .catch((e) => console.error("[reminders] xato:", (e as Error).message));

  setTimeout(tick, 30_000);
  setInterval(tick, 5 * 60_000).unref();
}
