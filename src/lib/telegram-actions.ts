"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getUserId } from "./session";
import { botUsername } from "./telegram/api";

/** Email hisobini Telegram'ga ulash: bir martalik kod bilan t.me/<bot>?start=link_<kod> ga yo'naltiradi. */
export async function startTelegramLink() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const code = randomBytes(18).toString("base64url"); // 24 belgi, start param chegarasi 64
  await db.user.update({
    where: { id: userId },
    data: { linkCode: code, linkCodeExp: new Date(Date.now() + 15 * 60_000) },
  });
  const username = await botUsername();
  redirect(`https://t.me/${username}?start=link_${code}`);
}

export async function unlinkTelegram() {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  // Faqat email+parolli hisobdan uzish mumkin — aks holda kirish yo'li qolmaydi
  await db.user.updateMany({ where: { id: userId, passwordHash: { not: null } }, data: { telegramId: null } });
  revalidatePath("/dashboard");
}
