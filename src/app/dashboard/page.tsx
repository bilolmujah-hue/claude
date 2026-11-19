import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Header } from "@/components/header";
import { TaskForm } from "@/components/task-form";
import { TaskItem, type TaskDTO } from "@/components/task-item";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { todayStr } from "@/lib/dates";
import { startTelegramLink, unlinkTelegram } from "@/lib/telegram-actions";
import { clearCompleted } from "@/lib/task-actions";

export const metadata = { title: "Mening vazifalarim — Vazifalar" };

const FILTERS = [
  { key: "all", label: "Hammasi" },
  { key: "active", label: "Faol" },
  { key: "done", label: "Bajarilgan" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  const sp = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.key === sp.filter) ? (sp.filter as Filter) : "all";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";

  const where: Prisma.TaskWhereInput = { userId: user.id };
  if (filter === "active") where.done = false;
  if (filter === "done") where.done = true;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [tasks, total, doneCount] = await Promise.all([
    db.task.findMany({ where, orderBy: [{ done: "asc" }, { priority: "desc" }, { dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }] }),
    db.task.count({ where: { userId: user.id } }),
    db.task.count({ where: { userId: user.id, done: true } }),
  ]);

  const today = todayStr();
  const overdue = await db.task.count({
    where: { userId: user.id, done: false, dueDate: { lt: new Date(`${today}T00:00:00Z`) } },
  });
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const items: TaskDTO[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    done: t.done,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
  }));

  const href = (f: Filter) => {
    const p = new URLSearchParams();
    if (f !== "all") p.set("filter", f);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Salom, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-muted">
            {total === 0 ? "Birinchi vazifangizni qo'shing." : `${total - doneCount} ta faol vazifa qoldi.`}
          </p>
        </div>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Jami" value={total} />
          <Stat label="Bajarilgan" value={`${percent}%`} />
          <Stat label="Muddati o'tgan" value={overdue} tone={overdue ? "danger" : undefined} />
        </section>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all" style={{ width: `${percent}%` }} />
        </div>

        {user.email && (
          <section className="tg-hide card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M21.9 4.6 18.7 19.7c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.5 1.8 12c-1-.3-1-1 .2-1.5L20.6 3.4c.9-.3 1.6.2 1.3 1.2z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium">
                  {user.telegramId ? "Telegram ulangan ✓" : "Telegram'da eslatma oling"}
                </p>
                <p className="text-xs text-muted">
                  {user.telegramId
                    ? "Muddati yaqinlashgan vazifalar haqida botga xabar keladi."
                    : "Botga ulang — muddat yaqinlashganda xabar yuboramiz."}
                </p>
              </div>
            </div>
            <form action={user.telegramId ? unlinkTelegram : startTelegramLink}>
              <button className={user.telegramId ? "btn-ghost w-full sm:w-auto" : "btn-primary w-full sm:w-auto"}>
                {user.telegramId ? "Uzish" : "Telegram'ni ulash"}
              </button>
            </form>
          </section>
        )}

        <div className="mt-6">
          <TaskForm />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex rounded-xl border border-border bg-card p-1 text-sm">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={href(f.key)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-center transition sm:flex-none ${
                  filter === f.key ? "bg-accent text-accent-foreground shadow" : "text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <form action="/dashboard" className="relative sm:w-64">
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
            <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Qidirish..." className="input pl-9" />
          </form>
        </div>

        {items.length === 0 ? (
          <div className="card mt-4 p-10 text-center">
            <p className="text-4xl">📝</p>
            <p className="mt-3 font-medium">{q || filter !== "all" ? "Hech narsa topilmadi" : "Hozircha vazifalar yo'q"}</p>
            <p className="mt-1 text-sm text-muted">
              {q || filter !== "all" ? "Filtr yoki qidiruvni o'zgartirib ko'ring." : "Yuqoridagi formadan yangi vazifa qo'shing."}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((t) => (
              <TaskItem key={`${t.id}-${t.done}`} task={t} today={today} />
            ))}
          </ul>
        )}

        {doneCount > 0 && (
          <form action={clearCompleted} className="mt-6 text-center">
            <button className="text-sm text-muted underline-offset-4 hover:text-rose-500 hover:underline">
              Bajarilganlarni tozalash ({doneCount})
            </button>
          </form>
        )}
      </main>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "danger" }) {
  return (
    <div className="card p-3 sm:p-4">
      <p className="text-xs text-muted sm:text-sm">{label}</p>
      <p className={`mt-1 text-xl font-semibold sm:text-2xl ${tone === "danger" ? "text-rose-500" : ""}`}>{value}</p>
    </div>
  );
}
