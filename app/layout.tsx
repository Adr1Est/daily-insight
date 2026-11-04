import type { Metadata } from "next";
import { Bungee, Barlow, Barlow_Condensed } from "next/font/google";
import "@/app/globals.css";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const barlow = Barlow({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-barlow" });
const barlowCondensed = Barlow_Condensed({ weight: ["600", "800"], subsets: ["latin"], variable: "--font-barlow-condensed" });

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
    <html lang="es" className={`${bungee.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
