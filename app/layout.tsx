import type { Metadata } from "next";
import { Quantico } from "next/font/google";
import "@/app/globals.css";

const quantico = Quantico({
  weight: "400",
  style: 'normal'
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
    <html lang="es">
      <body
        className={`${quantico.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
