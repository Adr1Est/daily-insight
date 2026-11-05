"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/components/site/site.module.css";
import ThemePicker from "@/components/site/ThemePicker";

const LINKS = [
  { href: "/", label: "Hoy" },
  { href: "/bugs", label: "Estantería" },
  { href: "/top", label: "Top 50" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={`${styles.logo} sign-float`}
        aria-label="Daily Bug, ir al bug de hoy"
      >
        Daily Bug
      </Link>
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
          <Link
            href="/ajustes"
            className={styles.settingsLink}
            aria-label="Ajustes"
            title="Ajustes"
            aria-current={pathname === "/ajustes" ? "page" : undefined}
          >
            <Settings size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
