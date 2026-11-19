export const TZ = "Asia/Tashkent";

/** Toshkent vaqti bo'yicha bugungi sana, "YYYY-MM-DD" */
export function todayStr(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

export function tashkentHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(now));
}

/** "YYYY-MM-DD" → UTC yarim tun (dueDate shu ko'rinishda saqlanadi) */
export function dayStart(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

export function addDays(day: string, n: number) {
  const d = dayStart(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dayOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function formatDay(d: Date) {
  const [y, m, dd] = dayOf(d).split("-");
  return `${dd}.${m}.${y}`;
}
