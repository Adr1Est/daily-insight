"use client";

import { Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import InstallApp from "@/components/site/InstallApp";
import styles from "@/components/site/site.module.css";
import ThemePicker from "@/components/site/ThemePicker";

const LINKS = [
  { href: "/", label: "Hoy" },
  { href: "/bugs", label: "Estantería" },
  { href: "/top", label: "Top 50" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const drawerId = useId();
  const [open, setOpen] = useState(false);

  // Al navegar desde el panel, se cierra: la página nueva queda a la vista.
  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  const openDrawer = () => {
    drawerRef.current?.showModal();
    setOpen(true);
  };
  const closeDrawer = () => drawerRef.current?.close();

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={`${styles.logo} sign-float`}
        aria-label="Daily Bug, ir al bug de hoy"
      >
        Daily Bug
      </Link>

      {/* Escritorio: navegación y herramientas en la cabecera. En móvil y tablet se ocultan por CSS. */}
      <div className={styles.headerEnd}>
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.navLink}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.tools}>
          <ThemePicker />
          <SettingsLink active={pathname === "/ajustes"} />
        </div>
      </div>

      {/* Móvil y tablet: un botón flotante abre el panel lateral con el logotipo y las opciones. */}
      <button
        type="button"
        className={styles.menuButton}
        onClick={openDrawer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={drawerId}
      >
        <Menu size={24} aria-hidden="true" />
        <span>Menú</span>
      </button>

      <dialog
        ref={drawerRef}
        id={drawerId}
        className={styles.drawer}
        aria-label="Menú"
        onToggle={(event) => setOpen(event.currentTarget.open)}
        onClose={() => setOpen(false)}
        // Un clic en el fondo (fuera del panel) llega al propio <dialog>: cierra.
        onClick={(event) => event.target === event.currentTarget && closeDrawer()}
      >
        <div className={styles.drawerInner}>
          <div className={styles.drawerHead}>
            <Link
              href="/"
              className={styles.logo}
              aria-label="Daily Bug, ir al bug de hoy"
              onClick={closeDrawer}
            >
              Daily Bug
            </Link>
            <button
              type="button"
              className={styles.drawerClose}
              onClick={closeDrawer}
              aria-label="Cerrar menú"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Principal">
            <ul className={styles.drawerNav}>
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={styles.drawerLink}
                    aria-current={pathname === href ? "page" : undefined}
                    onClick={closeDrawer}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <InstallApp />

          <div className={styles.drawerTools}>
            <ThemePicker />
            <SettingsLink active={pathname === "/ajustes"} onClick={closeDrawer} />
          </div>
        </div>
      </dialog>
    </header>
  );
}

function SettingsLink({ active, onClick }: { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/ajustes"
      className={styles.settingsLink}
      aria-label="Ajustes"
      title="Ajustes"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <Settings size={20} aria-hidden="true" />
    </Link>
  );
}
