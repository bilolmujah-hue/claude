import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";

const features = [
  { title: "Tez qo'shish", text: "Vazifani bir soniyada yozing, muhimlik va muddatini belgilang." },
  { title: "Filtr va qidiruv", text: "Faol, bajarilgan yoki hammasini ko'ring, kerakligini darhol toping." },
  { title: "Har joyda qulay", text: "Telefon, planshet va kompyuterda birdek chiroyli, dark mode bilan." },
];

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[28rem] max-w-3xl rounded-full bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-transparent blur-3xl" />
        <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Bepul va oddiy
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Kundalik ishlaringizni{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">tartibga soling</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Vazifalar — ortiqcha narsasiz, tez va chiroyli vazifalar menejeri. Rejalang, bajaring, xursand bo&apos;ling.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary px-6 py-3">Boshlash — bepul</Link>
            <Link href="/login" className="btn-ghost px-6 py-3">Hisobim bor</Link>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-5xl gap-4 px-4 pb-24 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Vazifalar
      </footer>
    </>
  );
}
