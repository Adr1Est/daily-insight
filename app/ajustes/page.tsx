import AppearanceSettings from "@/components/settings/AppearanceSettings";
import MyVotes from "@/components/settings/MyVotes";
import styles from "@/components/settings/settings.module.css";

// Página estática: todo lo que cambia (preferencias y votos) se lee en el navegador.
export const metadata = {
  title: "Ajustes · Daily Bug",
  description: "Tema, movimiento, tamaño del texto y tus votos en Daily Bug.",
};

export default function Settings() {
  return (
    <main className={styles.main}>
      <h1 className={`${styles.heading} sign-float`}>Ajustes</h1>
      <p className={styles.intro}>Ficha de socio · se guarda solo en este navegador</p>
      <div className={styles.card}>
        <MyVotes />
        <AppearanceSettings />
      </div>
    </main>
  );
}
