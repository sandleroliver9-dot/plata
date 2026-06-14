export const FALLBACK_CATEGORIES = [
  { id: "fallback-ingreso-sueldo", nombre: "Sueldo", tipo: "Ingreso" },
  { id: "fallback-ingreso-bono", nombre: "Bono", tipo: "Ingreso" },
  { id: "fallback-ingreso-extra", nombre: "Extra", tipo: "Ingreso" },
  { id: "fallback-ingreso-otro", nombre: "Otro", tipo: "Ingreso" },
  { id: "fallback-gasto-alquiler", nombre: "Alquiler", tipo: "Gasto" },
  { id: "fallback-gasto-servicios", nombre: "Servicios", tipo: "Gasto" },
  { id: "fallback-gasto-supermercado", nombre: "Supermercado", tipo: "Gasto" },
  { id: "fallback-gasto-transporte", nombre: "Transporte", tipo: "Gasto" },
  { id: "fallback-gasto-tarjeta", nombre: "Tarjeta", tipo: "Gasto" },
  { id: "fallback-gasto-prestamo", nombre: "Prestamo", tipo: "Gasto" },
  { id: "fallback-gasto-salud", nombre: "Salud", tipo: "Gasto" },
  { id: "fallback-gasto-ocio", nombre: "Ocio", tipo: "Gasto" },
  { id: "fallback-gasto-educacion", nombre: "Educacion", tipo: "Gasto" },
  { id: "fallback-gasto-otros", nombre: "Otros", tipo: "Gasto" },
] as const;

export function categoryNamesFor(
  categories: Array<{ nombre: string; tipo: string }> | null | undefined,
  tipo: "Ingreso" | "Gasto",
): string[] {
  const names = new Set<string>();
  const normalized = new Set<string>();
  const add = (name: string) => {
    const key = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (normalized.has(key)) return;
    normalized.add(key);
    names.add(name);
  };
  (categories ?? []).filter((c) => c.tipo === tipo).forEach((c) => add(c.nombre));
  FALLBACK_CATEGORIES.filter((c) => c.tipo === tipo).forEach((c) => add(c.nombre));
  return Array.from(names).sort((a, b) => a.localeCompare(b, "es"));
}
