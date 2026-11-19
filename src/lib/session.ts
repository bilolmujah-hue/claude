import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 kun

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET o'rnatilmagan yoki 32 belgidan qisqa");
  }
  return new TextEncoder().encode(secret);
}

/**
 * embedded=true — Telegram Web (web.telegram.org) Mini App'ni iframe ichida ochadi,
 * shuning uchun cookie SameSite=None; Secure; Partitioned bo'lishi kerak.
 * Server Actions Origin tekshiruvi CSRF'dan himoya qiladi.
 */
export async function createSession(userId: string, { embedded = false } = {}) {
  const prod = process.env.NODE_ENV === "production";
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: prod,
    sameSite: embedded && prod ? "none" : "lax",
    partitioned: embedded && prod,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}

export async function getUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  const id = await getUserId();
  if (!id) return null;
  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, telegramId: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
