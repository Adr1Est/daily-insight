import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Bungee } from "next/font/google";

import "@/app/globals.css";

import ReleaseMarquee from "@/components/site/ReleaseMarquee";
import ServiceWorker from "@/components/site/ServiceWorker";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import ThemeColorMeta from "@/components/site/ThemeColorMeta";
import { prefsInitScript } from "@/lib/prefs";
import { APP_DESCRIPTION, APP_NAME, installPromptScript, THEME_COLOR } from "@/lib/pwa";
import { themeCss, themeInitScript } from "@/lib/themes";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const barlow = Barlow({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-barlow" });
const barlowCondensed = Barlow_Condensed({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black" },
};

// ThemeColorMeta lo cambia al tema activo en el navegador.
export const viewport: Viewport = { themeColor: THEME_COLOR };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: el script de tema fija data-theme en <html> antes de hidratar.
    <html
      lang="es"
      className={`${bungee.variable} ${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
        <script dangerouslySetInnerHTML={{ __html: prefsInitScript() }} />
        <script dangerouslySetInnerHTML={{ __html: installPromptScript() }} />
      </head>
      <body>
        <ReleaseMarquee />
        <SiteHeader />
        {children}
        <SiteFooter />
        <ThemeColorMeta />
        <ServiceWorker />
        <Analytics />
      </body>
    </html>
  );
}
