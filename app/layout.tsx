import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Bungee } from "next/font/google";

import "@/app/globals.css";

import ReleaseMarquee from "@/components/site/ReleaseMarquee";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { prefsInitScript } from "@/lib/prefs";
import { themeCss, themeInitScript } from "@/lib/themes";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const barlow = Barlow({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-barlow" });
const barlowCondensed = Barlow_Condensed({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "Daily Bug",
  description:
    "Cada día, una curiosidad de la historia de los videojuegos: bugs, secretos, desarrollo, contenido descartado y localización.",
};

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
      </head>
      <body>
        <ReleaseMarquee />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
