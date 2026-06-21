import { q as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
const API_BASE = "http://localhost:3000";
async function apiFetch(path, options) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...token ? { Authorization: `Bearer ${token}` } : {}
    },
    body: options?.body ? JSON.stringify(options.body) : void 0,
    credentials: "include"
  });
  if (!res.ok) {
    const text2 = await res.text();
    throw new Error(text2 || `API ${res.status}`);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}
const apiClient = {
  // Categories
  categories: {
    list: () => apiFetch("/categories"),
    create: (data) => apiFetch("/categories", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/categories/${id}`, { method: "PUT", body: data }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: "DELETE" })
  }
};
const categoriasQuery = (userId) => queryOptions({
  queryKey: ["categorias", userId],
  enabled: !!userId,
  queryFn: async () => {
    const data = await apiClient.categories.list();
    return data ?? [];
  }
});
const FALLBACK_CATEGORIES = [
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
  { id: "fallback-gasto-otros", nombre: "Otros", tipo: "Gasto" }
];
function categoryNamesFor(categories, tipo) {
  const names = /* @__PURE__ */ new Set();
  const normalized = /* @__PURE__ */ new Set();
  const add = (name) => {
    const key = name.normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLowerCase();
    if (normalized.has(key)) return;
    normalized.add(key);
    names.add(name);
  };
  (categories ?? []).filter((c) => c.tipo === tipo).forEach((c) => add(c.nombre));
  FALLBACK_CATEGORIES.filter((c) => c.tipo === tipo).forEach((c) => add(c.nombre));
  return Array.from(names).sort((a, b) => a.localeCompare(b, "es"));
}
export {
  categoryNamesFor as a,
  categoriasQuery as c
};
