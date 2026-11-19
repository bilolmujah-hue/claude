import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Logo />
        <div className="flex items-center gap-2">
          <div className="tg-hide">
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted sm:block">{user.name}</span>
              <form action={logout} className="tg-hide">
                <button className="btn-ghost h-10">Chiqish</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary h-10">
              Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
