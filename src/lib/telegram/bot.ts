import "server-only";
import type { Task } from "@prisma/client";
import { db } from "../db";
import { addDays, dayOf, dayStart, formatDay, todayStr } from "../dates";
import { escapeHtml, tg, webAppButton } from "./api";

type TgUser = { id: number; first_name: string; last_name?: string };
type Message = { message_id: number; chat: { id: number; type: string }; from?: TgUser; text?: string };
type CallbackQuery = { id: string; from: TgUser; data?: string; message?: Message };
export type Update = { update_id: number; message?: Message; callback_query?: CallbackQuery };

const PRIORITY_ICON = { LOW: "🟢", MEDIUM: "🟡", HIGH: "🔴" } as const;

export function fullName(u: { first_name: string; last_name?: string }) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ").trim().slice(0, 50) || "Telegram foydalanuvchi";
}

export function send(chatId: number | string, text: string, reply_markup?: unknown) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup,
  });
}

export function taskLine(t: Pick<Task, "title" | "priority" | "dueDate">, today: string) {
  let due = "";
  if (t.dueDate) {
    const day = dayOf(t.dueDate);
    if (day < today) due = ` — ⚠️ <b>${formatDay(t.dueDate)}</b> (muddati o'tgan)`;
    else if (day === today) due = " — 📅 bugun";
    else if (day === addDays(today, 1)) due = " — 📅 ertaga";
    else due = ` — 📅 ${formatDay(t.dueDate)}`;
  }
  return `${PRIORITY_ICON[t.priority]} ${escapeHtml(t.title)}${due}`;
}

/** Vazifalar uchun "✅ Bajarildi" tugmalari (har qatorda bittadan, ko'pi bilan 10 ta) + ilovani ochish */
export function doneKeyboard(tasks: Pick<Task, "id" | "title">[]) {
  const rows = tasks.slice(0, 10).map((t) => [
    { text: `✅ ${t.title.length > 30 ? `${t.title.slice(0, 29)}…` : t.title}`, callback_data: `done:${t.id}` },
  ]);
  return { inline_keyboard: [...rows, ...(webAppButton()?.inline_keyboard ?? [])] };
}

async function onStart(msg: Message, payload: string) {
  if (payload.startsWith("link_")) return linkAccount(msg, payload.slice(5));

  await send(
    msg.chat.id,
    `Salom, <b>${escapeHtml(msg.from!.first_name)}</b>! 👋\n\n` +
      `Men <b>Vazifalar</b> botiman. Vazifalaringizni shu yerning o'zida boshqaring, ` +
      `muddati yaqinlashganda eslatib turaman.\n\n` +
      `Pastdagi tugma orqali ilovani oching — parolsiz avtomatik kirasiz.\n\n` +
      `/tasks — bugungi va muddati o'tgan vazifalar\n/help — yordam`,
    webAppButton(),
  );
}

async function linkAccount(msg: Message, code: string) {
  const tgId = String(msg.from!.id);
  const user = await db.user.findFirst({ where: { linkCode: code, linkCodeExp: { gt: new Date() } } });
  if (!user) {
    return send(msg.chat.id, "❌ Havola eskirgan yoki noto'g'ri. Saytdagi «Telegram'ni ulash» tugmasini qayta bosing.");
  }
  if (user.telegramId === tgId) {
    await db.user.update({ where: { id: user.id }, data: { linkCode: null, linkCodeExp: null } });
    return send(msg.chat.id, "✅ Bu Telegram allaqachon hisobingizga ulangan.", webAppButton());
  }

  const existing = await db.user.findUnique({ where: { telegramId: tgId } });
  if (existing?.email) {
    return send(msg.chat.id, "❌ Bu Telegram boshqa email hisobiga ulangan. Avval o'sha hisobda uzib qo'ying.");
  }

  await db.$transaction(async (tx) => {
    // Faqat Telegram orqali yaratilgan hisob bo'lsa — vazifalarini ko'chirib, o'sha hisobni o'chiramiz
    if (existing) {
      await tx.task.updateMany({ where: { userId: existing.id }, data: { userId: user.id } });
      await tx.user.delete({ where: { id: existing.id } });
    }
    await tx.user.update({ where: { id: user.id }, data: { telegramId: tgId, linkCode: null, linkCodeExp: null } });
  });

  await send(
    msg.chat.id,
    `✅ Telegram <b>${escapeHtml(user.email ?? user.name)}</b> hisobiga ulandi!\n\n` +
      `Endi muddati yaqinlashgan vazifalar haqida shu yerga eslatma yuboraman.`,
    webAppButton(),
  );
}

async function onTasks(msg: Message) {
  const user = await db.user.findUnique({ where: { telegramId: String(msg.from!.id) } });
  if (!user) {
    return send(msg.chat.id, "Sizda hali hisob yo'q. Ilovani oching — avtomatik ro'yxatdan o'tasiz.", webAppButton());
  }
  const today = todayStr();
  const tasks = await db.task.findMany({
    where: { userId: user.id, done: false, dueDate: { lt: dayStart(addDays(today, 1)) } },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    take: 30,
  });
  if (tasks.length === 0) {
    return send(msg.chat.id, "🎉 Bugunga va muddati o'tgan vazifalar yo'q. Zo'r!", webAppButton());
  }
  const overdue = tasks.filter((t) => dayOf(t.dueDate!) < today);
  const todays = tasks.filter((t) => dayOf(t.dueDate!) === today);
  const parts: string[] = [];
  if (overdue.length) {
    parts.push(`<b>⚠️ Muddati o'tgan (${overdue.length}):</b>\n${overdue.map((t) => taskLine(t, today)).join("\n")}`);
  }
  if (todays.length) {
    parts.push(`<b>📅 Bugun (${todays.length}):</b>\n${todays.map((t) => taskLine(t, today)).join("\n")}`);
  }
  await send(msg.chat.id, `${parts.join("\n\n")}\n\nBajarganingizni pastdan belgilang 👇`, doneKeyboard(tasks));
}

async function onHelp(msg: Message) {
  await send(
    msg.chat.id,
    `<b>Vazifalar bot — yordam</b>\n\n` +
      `/start — boshlash va ilovani ochish\n` +
      `/tasks — bugungi va muddati o'tgan vazifalar\n` +
      `/help — shu xabar\n\n` +
      `📱 Ilovani pastdagi <b>Menu</b> tugmasi yoki /start dagi tugma orqali oching.\n` +
      `🔔 Muddati bugun yoki ertaga bo'lgan vazifalar haqida soat 09:00–22:00 oralig'ida bir marta eslataman.\n` +
      `🔗 Saytda email bilan ro'yxatdan o'tgan bo'lsangiz, u yerdagi «Telegram'ni ulash» tugmasi orqali hisoblarni birlashtiring.`,
    webAppButton(),
  );
}

async function onCallback(cb: CallbackQuery) {
  const [action, taskId] = (cb.data ?? "").split(":");
  if (action !== "done" || !taskId) return tg("answerCallbackQuery", { callback_query_id: cb.id });

  const user = await db.user.findUnique({ where: { telegramId: String(cb.from.id) } });
  const res = user
    ? await db.task.updateMany({ where: { id: taskId, userId: user.id, done: false }, data: { done: true } })
    : { count: 0 };
  await tg("answerCallbackQuery", {
    callback_query_id: cb.id,
    text: res.count ? "✅ Bajarildi deb belgilandi" : "Vazifa topilmadi yoki allaqachon bajarilgan",
  });
}

export async function handleUpdate(update: Update) {
  if (update.callback_query) return onCallback(update.callback_query);

  const msg = update.message;
  if (!msg?.text || !msg.from || msg.chat.type !== "private") return;

  const [rawCmd, ...rest] = msg.text.trim().split(/\s+/);
  const cmd = rawCmd.split("@")[0].toLowerCase();
  switch (cmd) {
    case "/start":
      return onStart(msg, rest.join(" "));
    case "/tasks":
      return onTasks(msg);
    case "/help":
      return onHelp(msg);
    default:
      return send(msg.chat.id, "Buyruqni tushunmadim 🤔 /help ni bosing.", webAppButton());
  }
}
