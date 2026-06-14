import { Input } from "@/components/ui/input";
import { useId } from "react";

export const TARJETA_OPTIONS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Naranja",
  "Naranja X",
  "Cabal",
  "Diners Club",
  "Argencard",
  "Cencosud",
  "Carrefour",
  "Nativa",
  "Patagonia 365",
  "Galicia Visa",
  "Galicia Mastercard",
  "Macro Visa",
  "Macro Mastercard",
  "Santander Visa",
  "Santander Mastercard",
  "BBVA Visa",
  "BBVA Mastercard",
  "BNA+",
  "Mercado Crédito",
  "Otra",
] as const;

export function TarjetaCombo({
  value,
  onChange,
  placeholder = "Elegí o escribí...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <>
      <Input
        list={id}
        value={value}
        maxLength={50}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={id}>
        {TARJETA_OPTIONS.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
