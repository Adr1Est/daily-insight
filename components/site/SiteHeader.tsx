'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/site/site.module.css";

const LINKS = [
  { href: "/", label: "Hoy" },
  { href: "/bugs", label: "Estantería" },
];

export default function SiteHeader(){
  const pathname = usePathname();

  return(
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="Daily Bug, ir al bug de hoy">
        Daily Bug
      </Link>
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
    </header>
  )
}
