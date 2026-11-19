# Vazifalar — Todo web app

Next.js 16 + TypeScript + Tailwind + PostgreSQL (Prisma) asosidagi vazifalar menejeri.
Ro'yxatdan o'tish/kirish, vazifa qo'shish, tahrirlash, bajarildi deb belgilash, muhimlik, muddat, filtr va qidiruv. Dark mode va mobilga moslashgan.

## Lokal ishga tushirish
```bash
cp .env.example .env   # DATABASE_URL va AUTH_SECRET ni to'ldiring
npm install
npx prisma migrate deploy
npm run dev
```

Batafsil: [CLAUDE.md](CLAUDE.md)
