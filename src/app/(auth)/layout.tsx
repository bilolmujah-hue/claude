import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </>
  );
}
