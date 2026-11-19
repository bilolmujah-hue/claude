import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

/**
 * Telegram Mini App initData'ni tekshiradi:
 * secret = HMAC_SHA256(key="WebAppData", bot_token)
 * hash   = HMAC_SHA256(key=secret, data_check_string)  (hex)
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(
  initData: string,
  token: string,
  maxAgeSeconds = 24 * 60 * 60,
  now = Date.now(),
): TelegramUser | null {
  if (!initData || initData.length > 4096) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest();
  if (!timingSafeEqual(expected, Buffer.from(hash, "hex"))) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || now / 1000 - authDate > maxAgeSeconds) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "") as TelegramUser;
    return typeof user?.id === "number" && user.first_name !== undefined ? user : null;
  } catch {
    return null;
  }
}
