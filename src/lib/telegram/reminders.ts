import "server-only";
import { db } from "../db";
import { addDays, dayOf, dayStart, tashkentHour, todayStr } from "../dates";
import { doneKeyboard, send, taskLine } from "./bot";

/**
 * Muddati bugun/ertaga (yoki o'tib ketgan) bo'lgan, hali eslatilmagan vazifalar uchun
 * foydalanuvchiga bitta jamlangan xabar yuboradi. Faqat Toshkent vaqti 09:00–22:00 oralig'ida.
 * remindedAt "claim" qilinadi — bir vaqtda ikki instance ishlasa ham ikki marta yuborilmaydi.
 */
export async function sendDueReminders(now = new Date()) {
  const hour = tashkentHour(now);
  if (hour < 9 || hour >= 22) return { sent: 0, skipped: "tun" };

  const today = todayStr(now);
  const candidates = await db.task.findMany({
    where: {
      done: false,
      remindedAt: null,
      dueDate: { lt: dayStart(addDays(today, 2)) },
      user: { telegramId: { not: null } },
    },
    select: { id: true, title: true, priority: true, dueDate: true, userId: true, user: { select: { telegramId: true } } },
    orderBy: { dueDate: "asc" },
    take: 500,
  });

  const byUser = new Map<string, typeof candidates>();
  for (const t of candidates) byUser.set(t.userId, [...(byUser.get(t.userId) ?? []), t]);

  let sent = 0;
  for (const [, tasks] of byUser) {
    const claimed = await db.task.updateMany({
      where: { id: { in: tasks.map((t) => t.id) }, remindedAt: null },
      data: { remindedAt: now },
    });
    if (claimed.count === 0) continue;

    const chatId = tasks[0].user.telegramId!;
    const lines = tasks.map((t) => taskLine(t, today)).join("\n");
    const anyOverdue = tasks.some((t) => dayOf(t.dueDate!) < today);
    const title = anyOverdue ? "⏰ <b>Eslatma: muddati o'tgan / yaqinlashgan vazifalar</b>" : "⏰ <b>Eslatma: muddat yaqinlashmoqda</b>";
    try {
      await send(chatId, `${title}\n\n${lines}`, doneKeyboard(tasks));
      sent++;
    } catch (e) {
      // Foydalanuvchi botni bloklagan bo'lishi mumkin — qayta urinmaymiz
      console.warn("[reminders] yuborilmadi:", (e as Error).message);
    }
  }
  return { sent };
}
