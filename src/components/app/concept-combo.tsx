import { Input } from "@/components/ui/input";
import { useId } from "react";

export const CONCEPT_OPTIONS = {
  Ingreso: [
    "Sueldo", "Bono", "Aguinaldo", "Freelance", "Honorarios", "Venta", "Reintegro",
    "Intereses", "Dividendos", "Alquiler cobrado", "Regalo", "Otro",
  ],
  Gasto: [
    "Supermercado", "Almacén", "Verdulería", "Carnicería", "Comida afuera", "Café", "Delivery",
    "Nafta", "Transporte", "Estacionamiento", "Peajes", "Uber/Taxi",
    "Farmacia", "Salud", "Prepaga", "Gimnasio",
    "Ropa", "Hogar", "Regalo", "Viaje", "Ocio", "Streaming",
    "Tarjeta de crédito", "Préstamo", "Cuota", "Educación", "Otro",
  ],
  GastoFijo: [
    "Alquiler", "Expensas", "Luz", "Gas", "Agua", "Internet", "Celular",
    "Cable", "Streaming (Netflix, Spotify...)", "Seguro", "Prepaga", "Gimnasio",
    "Colegio", "Cochera", "ABL/Impuestos", "Otro",
  ],
} as const;

export type ConceptKind = keyof typeof CONCEPT_OPTIONS;

export function ConceptCombo({
  kind,
  value,
  onChange,
  placeholder = "Elegí o escribí...",
  maxLength = 100,
}: {
  kind: ConceptKind;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  const options = CONCEPT_OPTIONS[kind];
  return (
    <>
      <Input
        list={id}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={id}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
    </>
  );
}
