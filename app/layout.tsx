import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Bungee } from "next/font/google";

import "@/app/globals.css";

import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
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
  description: "Descubre cada día un bug de la historia de los videojuegos.",
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
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
