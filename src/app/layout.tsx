import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TelegramTheme } from "@/components/telegram-theme";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vazifalar — kundalik ishlaringizni tartibga soling",
  description: "Oddiy, tez va chiroyli vazifalar menejeri.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d14" },
  ],
};

// 1) Telegram Mini App ichida: URL hash'dagi tgWebAppThemeParams (yoki sessionStorage) bo'yicha darhol mavzu qo'llanadi.
// 2) Oddiy brauzerda: localStorage yoki tizim sozlamasi bo'yicha dark/light.
const themeScript = `(function(){var r=document.documentElement;try{var tg=null,h=location.hash;if(h.indexOf('tgWebAppThemeParams=')>-1){var q=new URLSearchParams(h.slice(1));var p=JSON.parse(q.get('tgWebAppThemeParams'));var b=(p.bg_color||'#ffffff').replace('#','');var l=(parseInt(b.substr(0,2),16)*299+parseInt(b.substr(2,2),16)*587+parseInt(b.substr(4,2),16)*114)/1000;tg={p:p,scheme:l<128?'dark':'light'};sessionStorage.setItem('tgTheme',JSON.stringify(tg))}else{var s=sessionStorage.getItem('tgTheme');if(s)tg=JSON.parse(s)}if(tg){var P=tg.p,S=function(n,v){v&&r.style.setProperty(n,v)};r.classList.add('tg');r.classList.toggle('dark',tg.scheme==='dark');S('--background',P.secondary_bg_color||P.bg_color);S('--card',P.section_bg_color||P.bg_color);S('--foreground',P.text_color);S('--muted',P.hint_color||P.subtitle_text_color);S('--accent',P.button_color);S('--accent-foreground',P.button_text_color);P.text_color&&r.style.setProperty('--border','color-mix(in srgb, '+P.text_color+' 12%, transparent)');return}}catch(e){}try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <TelegramTheme />
      </body>
    </html>
  );
}
