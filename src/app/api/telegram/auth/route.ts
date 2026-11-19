import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { botToken } from "@/lib/telegram/api";
import { fullName } from "@/lib/telegram/bot";
import { verifyInitData } from "@/lib/telegram/init-data";

export const dynamic = "force-dynamic";

/** Mini App initData'ni HMAC bilan tekshiradi va foydalanuvchini parolsiz kiritadi. */
export async function POST(req: Request) {
  const token = botToken();
  if (!token) return Response.json({ error: "Bot sozlanmagan" }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { initData?: unknown } | null;
  const initData = typeof body?.initData === "string" ? body.initData : "";
  const tgUser = verifyInitData(initData, token);
  if (!tgUser) return Response.json({ error: "Telegram ma'lumotlari tasdiqlanmadi" }, { status: 401 });

  const telegramId = String(tgUser.id);
  const user = await db.user.upsert({
    where: { telegramId },
    update: {},
    create: { telegramId, name: fullName(tgUser) },
    select: { id: true },
  });

  await createSession(user.id, { embedded: true });
  return Response.json({ ok: true });
}
