import { timingSafeEqual } from "node:crypto";
import { webhookSecret } from "@/lib/telegram/api";
import { handleUpdate, type Update } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

function validSecret(header: string | null) {
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(webhookSecret());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!validSecret(req.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("Forbidden", { status: 403 });
  }

  let update: Update;
  try {
    update = (await req.json()) as Update;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    await handleUpdate(update);
  } catch (e) {
    // 200 qaytaramiz — aks holda Telegram shu update'ni qayta-qayta yuboradi
    console.error("[telegram] update xatosi:", (e as Error).message);
  }
  return Response.json({ ok: true });
}
