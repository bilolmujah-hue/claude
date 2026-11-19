import { AuthForm } from "@/components/auth-form";
import { login } from "@/lib/auth-actions";

export const metadata = { title: "Kirish — Vazifalar" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
