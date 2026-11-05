"use client";

import styles from "@/components/settings/settings.module.css";

interface Option {
  value: string;
  label: string;
  /** Contenido extra delante del rótulo (p. ej. la muestra de un tema). */
  before?: React.ReactNode;
}

interface OptionGroupProps {
  name: string;
  /** id del rótulo de la fila de la ficha que nombra el grupo. */
  labelledBy: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  /** «row»: celdas en fila (opciones cortas); «list»: una por línea (temas). */
  layout?: "row" | "list";
}

/** Opciones de la ficha de socio: celdas con filete de tinta, la elegida invertida. */
export default function OptionGroup({
  name,
  labelledBy,
  options,
  value,
  onChange,
  layout = "row",
}: OptionGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={styles.options}
      data-layout={layout}
      style={layout === "row" ? { gridTemplateColumns: `repeat(${options.length}, 1fr)` } : {}}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          {option.before}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
