import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { PWA_ICONS, THEME_COLOR, type PwaIconVariant } from "@/lib/pwa";

// Iconos PNG del manifest. Se generan en el build a partir de app/icon.svg (fuente única del
// dibujo), así que no hay que mantener PNG a mano.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PWA_ICONS).map((variant) => ({ variant }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const icon = PWA_ICONS[variant as PwaIconVariant];
  if (!icon) return new Response("Not found", { status: 404 });

  const svg = await readFile(join(process.cwd(), "app/icon.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  // Maskable: el sistema recorta hasta un círculo del 80 %; el dibujo va reducido sobre el
  // mismo fondo del lomo para que la «B» y su sombra no se corten.
  const inner = icon.maskable ? Math.round(icon.size * 0.7) : icon.size;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME_COLOR,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={src} width={inner} height={inner} />
    </div>,
    { width: icon.size, height: icon.size },
  );
}
