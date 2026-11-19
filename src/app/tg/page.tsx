import { TelegramLogin } from "./tg-login";

export const metadata = { title: "Vazifalar — Telegram" };

export default function TelegramEntry() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <TelegramLogin />
    </main>
  );
}
