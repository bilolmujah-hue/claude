# Vazifalar — Todo web app

@AGENTS.md

## Maqsad
Foydalanuvchi ro'yxatdan o'tadi / kiradi va o'z vazifalarini boshqaradi: qo'shish,
tahrirlash, bajarildi deb belgilash, o'chirish, muhimlik va muddat berish, filtrlash va qidirish.
Har bir foydalanuvchi faqat o'z vazifalarini ko'radi.

## Stack
- Next.js 16 (App Router, Server Actions, Turbopack) + TypeScript
- Tailwind CSS v4 — dark mode (tizim sozlamasi + qo'lda almashtirish, `class` asosida)
- PostgreSQL + Prisma 6 (`prisma/schema.prisma`)
- Auth: o'zimizniki — bcryptjs (parol hash) + jose (HS256 JWT, httpOnly cookie)
- Validatsiya: zod
- Deploy: Railway (Nixpacks/Railpack), Postgres plugin

## Sahifalar
| Yo'l | Tavsif |
|------|--------|
| `/` | Landing: ilova haqida, Kirish / Ro'yxatdan o'tish tugmalari (kirgan bo'lsa → `/dashboard`) |
| `/login` | Kirish formasi |
| `/register` | Ro'yxatdan o'tish formasi |
| `/dashboard` | Vazifalar ro'yxati, qo'shish formasi, filtrlar (hammasi/faol/bajarilgan), qidiruv, statistika |
| `/api/health` | Health-check (Railway uchun) |
| `/tg` | Telegram Mini App kirish nuqtasi: initData → `/api/telegram/auth` → `/dashboard` |
| `/api/telegram/auth` | POST {initData} — HMAC tekshiruvi, foydalanuvchini upsert qilib sessiya ochadi |
| `/api/telegram/webhook` | Bot webhook, `X-Telegram-Bot-Api-Secret-Token` bilan himoyalangan |

## Ma'lumotlar modeli
- `User`: id, name, email? (unique), passwordHash?, telegramId? (unique), linkCode?, linkCodeExp?, createdAt
- `Task`: id, title, description?, done, priority (LOW/MEDIUM/HIGH), dueDate?, remindedAt?, userId, createdAt, updatedAt

## Muhit o'zgaruvchilari (faqat Railway'da / lokal `.env` da, GitHub'ga TUSHMAYDI)
- `DATABASE_URL` — Postgres ulanish satri
- `AUTH_SECRET` — JWT imzolash uchun kamida 32 belgili tasodifiy satr (webhook secret ham shundan HMAC bilan hosil qilinadi)
- `APP_URL` — ilovaning ochiq manzili, oxirida `/` siz (webhook va Mini App URL'i shundan olinadi)
- `TELEGRAM_BOT_TOKEN` — bot tokeni; faqat `process.env`dan o'qiladi, hech qachon log/commit qilinmaydi

## Buyruqlar
- `npm run dev` — lokal ishga tushirish
- `npm run build` — `prisma generate` + `next build`
- `npm start` — `prisma migrate deploy` + `next start` (Railway shu bilan ishga tushadi)
- `npx prisma migrate dev --name <nom>` — yangi migratsiya

## Qoidalar
- `.env*` hech qachon commit qilinmaydi (repo PUBLIC).
- Har bir server action sessiyani o'zi tekshiradi va faqat `userId` bo'yicha ishlaydi.
- `cacheComponents` o'chirilgan — sahifalar dinamik render qilinadi.

## Telegram integratsiyasi (`src/lib/telegram/`)
- `api.ts` — Bot API chaqiruvlari, `APP_URL`, webhook secret
- `init-data.ts` — Mini App initData HMAC tekshiruvi (24 soat amal qiladi)
- `bot.ts` — /start (+ `link_<kod>` hisob ulash), /tasks, /help, "✅ Bajarildi" callback
- `reminders.ts` — muddati bugun/ertaga/o'tgan vazifalar uchun 09:00–22:00 (Toshkent) oralig'ida bir martalik eslatma
- `setup.ts` — setWebhook, setMyCommands, setChatMenuButton
- `src/instrumentation.ts` — production'da server ishga tushganda setup + har 5 daqiqada eslatmalar
- Mini App iframe'da (Telegram Web) ochilgani uchun sessiya cookie'si `SameSite=None; Secure; Partitioned`
- Mavzu: Telegram `themeParams` CSS o'zgaruvchilariga o'tkaziladi (`components/telegram-theme.tsx` + layout'dagi inline skript)
- Domenni o'zgartirish: faqat Railway'da `APP_URL`ni yangilang — qayta ishga tushganda webhook va Menu tugmasi o'zi yangilanadi
