import { isMockMode } from "@/lib/data";
import { AI_MODEL, AI_MODEL_URL } from "@/lib/insights/model";
import { Github, Linkedin, Globe } from "lucide-react";
import styles from "@/components/site/site.module.css";

const LINKS = [
  { href: "https://github.com/Adr1Est", label: "GitHub", Icon: Github },
  { href: "https://www.linkedin.com/in/adrianestevezsalamanca/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.adrianestevezs.dev", label: "Web personal", Icon: Globe },
];

export default function SiteFooter(){
  return(
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Desarrollado por Adrián Estévez</p>
      <ul className={styles.social}>
        {LINKS.map(({ href, label, Icon }) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (se abre en otra pestaña)`}>
              <Icon size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {isMockMode() ? (
        <p>Mostrando datos de ejemplo</p>
      ) : (
        <p>
          Bugs escritos por IA con{" "}
          <a href={AI_MODEL_URL} target="_blank" rel="noopener noreferrer">
            {AI_MODEL}
          </a>
        </p>
      )}
    </footer>
  )
}
