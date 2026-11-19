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

## Ma'lumotlar modeli
- `User`: id, name, email (unique), passwordHash, createdAt
- `Task`: id, title, description?, done, priority (LOW/MEDIUM/HIGH), dueDate?, userId, createdAt, updatedAt

## Muhit o'zgaruvchilari (faqat Railway'da / lokal `.env` da, GitHub'ga TUSHMAYDI)
- `DATABASE_URL` — Postgres ulanish satri
- `AUTH_SECRET` — JWT imzolash uchun kamida 32 belgili tasodifiy satr

## Buyruqlar
- `npm run dev` — lokal ishga tushirish
- `npm run build` — `prisma generate` + `next build`
- `npm start` — `prisma migrate deploy` + `next start` (Railway shu bilan ishga tushadi)
- `npx prisma migrate dev --name <nom>` — yangi migratsiya

## Qoidalar
- `.env*` hech qachon commit qilinmaydi (repo PUBLIC).
- Har bir server action sessiyani o'zi tekshiradi va faqat `userId` bo'yicha ishlaydi.
- `cacheComponents` o'chirilgan — sahifalar dinamik render qilinadi.
