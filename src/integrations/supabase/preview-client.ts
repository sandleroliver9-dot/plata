const PREVIEW_MODE_KEY = "plata_preview_mode";
const PREVIEW_STORE_KEY = "plata_preview_store_v2";
export const PREVIEW_USER_ID = "preview-user";

type Row = Record<string, any>;
type Store = Record<string, Row[]>;

const nowISO = () => new Date().toISOString();

const previewUser = {
  id: PREVIEW_USER_ID,
  email: "preview@plata.local",
  user_metadata: { full_name: "Preview" },
};

const previewSession = {
  access_token: "preview-token",
  refresh_token: "preview-refresh",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: previewUser,
};

const defaultCategories = [
  ["Sueldo", "Ingreso", "Alta", "#10b981"],
  ["Bonos", "Ingreso", "Media", "#34d399"],
  ["Extra", "Ingreso", "Baja", "#6ee7b7"],
  ["Alquiler", "Gasto", "Alta", "#ef4444"],
  ["Servicios", "Gasto", "Alta", "#f97316"],
  ["Supermercado", "Gasto", "Alta", "#f59e0b"],
  ["Transporte", "Gasto", "Media", "#eab308"],
  ["Tarjeta", "Gasto", "Alta", "#8b5cf6"],
  ["Préstamo", "Gasto", "Alta", "#a855f7"],
  ["Salud", "Gasto", "Alta", "#ec4899"],
  ["Ocio", "Gasto", "Baja", "#06b6d4"],
  ["Educación", "Gasto", "Media", "#3b82f6"],
  ["Otros", "Gasto", "Baja", "#64748b"],
].map(([nombre, tipo, prioridad, color], index) => ({
  id: `preview-cat-${index}`,
  user_id: PREVIEW_USER_ID,
  nombre,
  tipo,
  prioridad,
  color,
  activo: true,
  created_at: nowISO(),
}));

function initialStore(): Store {
  return {
    profiles: [{
      id: PREVIEW_USER_ID,
      display_name: "Preview",
      country: "AR",
      currency: "ARS",
      salary: 0,
      pay_day: 1,
      overdraft_allowed: 0,
      onboarding_done: true,
      saving_target: 20,
      created_at: nowISO(),
      updated_at: nowISO(),
    }],
    categorias: defaultCategories,
    movimientos: [],
    ingresos: [],
    gastos_fijos: [],
    tarjetas_cuotas: [],
    prestamos: [],
    inversiones: [],
    inmuebles: [],
    metas: [],
    vencimientos: [],
    feedback: [],
    inversiones_activos: [],
    inversiones_compras: [],
    inversiones_ventas: [],
    inversiones_dividendos: [],
  };
}

export function isPreviewMode() {
  return typeof window !== "undefined" && window.localStorage.getItem(PREVIEW_MODE_KEY) === "1";
}

export function enablePreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_MODE_KEY, "1");
  getStore();
}

export function disablePreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREVIEW_MODE_KEY);
}

function getStore(): Store {
  if (typeof window === "undefined") return initialStore();
  const raw = window.localStorage.getItem(PREVIEW_STORE_KEY);
  if (raw) {
    try {
      return { ...initialStore(), ...JSON.parse(raw) };
    } catch {
      // Recreate corrupted preview data instead of blocking the app.
    }
  }
  const store = initialStore();
  saveStore(store);
  return store;
}

function saveStore(store: Store) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PREVIEW_STORE_KEY, JSON.stringify(store));
  }
}

function idFor(table: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${table}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const activeTables = new Set([
  "movimientos",
  "ingresos",
  "gastos_fijos",
  "tarjetas_cuotas",
  "prestamos",
  "inversiones",
  "inmuebles",
  "inversiones_activos",
]);

function project(row: Row, columns: string) {
  if (!columns || columns.trim() === "*") return { ...row };
  const keys = columns.split(",").map((c) => c.trim()).filter(Boolean);
  const out: Row = {};
  keys.forEach((key) => {
    const cleanKey = key.split(":").pop()!.trim();
    out[cleanKey] = row[cleanKey];
  });
  return out;
}

class PreviewQuery {
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: any;
  private columns = "*";
  private filters: Array<{ column: string; value: any }> = [];
  private inFilters: Array<{ column: string; values: any[] }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private returning = false;

  constructor(private table: string) {}

  select(columns = "*") {
    this.columns = columns;
    if (this.operation !== "select") this.returning = true;
    return this;
  }

  insert(payload: any) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.inFilters.push({ column, values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    return this.execute("maybe");
  }

  single() {
    return this.execute("single");
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matches(row: Row) {
    return this.filters.every((f) => row[f.column] === f.value)
      && this.inFilters.every((f) => f.values.includes(row[f.column]));
  }

  private readRows(store: Store) {
    let rows = (store[this.table] ?? []).filter((row) => this.matches(row)).map((row) => ({ ...row }));
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      rows = rows.sort((a, b) => {
        const av = a[column] ?? "";
        const bv = b[column] ?? "";
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount != null) rows = rows.slice(0, this.limitCount);
    return rows.map((row) => project(row, this.columns));
  }

  private async execute(singleMode?: "single" | "maybe") {
    const store = getStore();
    store[this.table] = store[this.table] ?? [];

    if (this.operation === "select") {
      const data = this.readRows(store);
      return { data: singleMode ? (data[0] ?? null) : data, error: null };
    }

    if (this.operation === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((item) => {
        const row = { ...item };
        row.id = row.id ?? idFor(this.table);
        row.created_at = row.created_at ?? nowISO();
        if (activeTables.has(this.table) && row.activo == null) row.activo = true;
        return row;
      });
      store[this.table].push(...inserted);
      saveStore(store);
      const data = this.returning ? inserted.map((row) => project(row, this.columns)) : null;
      return { data: singleMode ? ((data as Row[] | null)?.[0] ?? null) : data, error: null };
    }

    if (this.operation === "update") {
      const updated: Row[] = [];
      store[this.table] = store[this.table].map((row) => {
        if (!this.matches(row)) return row;
        const next = { ...row, ...this.payload, updated_at: nowISO() };
        updated.push(next);
        return next;
      });
      saveStore(store);
      const data = this.returning ? updated.map((row) => project(row, this.columns)) : null;
      return { data: singleMode ? ((data as Row[] | null)?.[0] ?? null) : data, error: null };
    }

    const kept: Row[] = [];
    const removed: Row[] = [];
    for (const row of store[this.table]) {
      if (this.matches(row)) removed.push(row);
      else kept.push(row);
    }
    store[this.table] = kept;
    saveStore(store);
    const data = this.returning ? removed.map((row) => project(row, this.columns)) : null;
    return { data: singleMode ? ((data as Row[] | null)?.[0] ?? null) : data, error: null };
  }
}

export function createPreviewSupabaseClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: previewSession }, error: null }),
      getUser: async () => ({ data: { user: previewUser }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
      signOut: async () => {
        disablePreviewMode();
        return { error: null };
      },
      signInAnonymously: async () => {
        enablePreviewMode();
        return { data: { session: previewSession, user: previewUser }, error: null };
      },
    },
    from: (table: string) => new PreviewQuery(table),
  };
}
