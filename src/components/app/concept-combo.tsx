import { useState } from "react";
import { Input } from "@/components/ui/input";

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

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Antes esto era un <input list> con <datalist> nativo. En navegadores de
// celular el datalist se comporta mal (las sugerencias tapan el campo, y
// despues de elegir una opcion cuesta volver a editar el texto) — un tester
// real reporto exactamente esos sintomas al cargar un movimiento. Este
// dropdown propio hace lo mismo pero de forma controlada y consistente en
// desktop y mobile: escribis libre, y las sugerencias filtradas aparecen
// abajo para tocar una si queres.
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
  const [open, setOpen] = useState(false);
  const options = CONCEPT_OPTIONS[kind];
  const query = normalize(value.trim());
  const filtered = query ? options.filter((o) => normalize(o).includes(query)) : [...options];
  // Si lo único que matchea es exactamente lo que ya está escrito, no hay
  // nada nuevo para sugerir: ocultar la lista en vez de taparle el form.
  const showList = open && filtered.length > 0 && !(filtered.length === 1 && filtered[0] === value);

  return (
    <div className="relative">
      <Input
        value={value}
        maxLength={maxLength}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showList && (
        <div className="absolute z-50 mt-1 w-full max-h-44 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => { onChange(o); setOpen(false); }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
