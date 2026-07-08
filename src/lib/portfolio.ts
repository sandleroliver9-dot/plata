// Portfolio computations: weighted avg price, realized G/P, annualized return, etc.

export type Activo = {
  id: string;
  ticker: string | null;
  nombre: string;
  tipo: string;
  sector: string | null;
  moneda_base: string;
  valor_actual_usd: number | null;
  precio_actualizado_en: string | null;
  activo: boolean;
};

export type Compra = { id: string; activo_id: string; fecha: string; cantidad: number; precio_usd: number; tc: number | null; broker: string | null };
export type Venta = { id: string; activo_id: string; fecha: string; cantidad: number; precio_usd: number; tc: number | null };
export type Dividendo = { id: string; activo_id: string; fecha: string; monto_usd: number; tc: number | null };

export type BalanceRow = {
  activo: Activo;
  cantidad: number;
  totalCompradoUSD: number;
  totalCompradoARS: number;
  pMedioUSD: number;
  pMedioARS: number;
  pActualUSD: number;
  pActualARS: number;
  valorUSD: number;
  valorARS: number;
  deltaPct: number;
  tAnual: number;
  dias: number;
  primeraCompra: string | null;
  divUSDTotal: number;
  divUSD365: number;
  dyPct: number;
  realizadaUSD: number;
  pctPortfolio: number;
};

export type BalanceWarning = { activoId: string; ventaId: string; message: string };

export function computeBalance(
  activos: Activo[],
  compras: Compra[],
  ventas: Venta[],
  dividendos: Dividendo[],
  tcActual: number,
): { rows: BalanceRow[]; warnings: BalanceWarning[] } {
  const today = Date.now();
  const rows: BalanceRow[] = [];
  const warnings: BalanceWarning[] = [];

  for (const a of activos) {
    const cs = compras.filter((c) => c.activo_id === a.id);
    const vs = ventas.filter((v) => v.activo_id === a.id);
    const ds = dividendos.filter((d) => d.activo_id === a.id);
    const events = [
      ...cs.map((c) => ({ kind: "compra" as const, fecha: c.fecha, row: c })),
      ...vs.map((v) => ({ kind: "venta" as const, fecha: v.fecha, row: v })),
    ].sort((x, y) => x.fecha.localeCompare(y.fecha) || (x.kind === "compra" ? -1 : 1));

    let cantidad = 0;
    let costoUSD = 0;
    let costoARS = 0;
    let realizadaUSD = 0;
    let totalCompradoUSD = 0;
    let totalCompradoARS = 0;
    let primera: string | null = null;

    for (const event of events) {
      if (event.kind === "compra") {
        const c = event.row;
        const q = Math.max(0, Number(c.cantidad));
        const usd = Math.max(0, Number(c.precio_usd));
        const arsTc = Number(c.tc || tcActual);
        if (q <= 0 || usd <= 0) continue;
        if (!primera) primera = c.fecha;
        cantidad += q;
        costoUSD += q * usd;
        costoARS += q * usd * arsTc;
        totalCompradoUSD += q * usd;
        totalCompradoARS += q * usd * arsTc;
      } else {
        const v = event.row;
        const solicitada = Math.max(0, Number(v.cantidad));
        const q = Math.min(solicitada, cantidad);
        const usd = Math.max(0, Number(v.precio_usd));
        if (q <= 0 || usd <= 0 || cantidad <= 0) {
          // No hay tenencia disponible para esta venta (ej: la compra que la
          // respaldaba se borró). Antes se salteaba en silencio; ahora se
          // reporta como inconsistencia en vez de perderse sin dejar rastro.
          if (solicitada > 0) {
            warnings.push({
              activoId: a.id,
              ventaId: v.id,
              message: `Venta del ${v.fecha} de ${a.nombre} no tiene tenencia disponible para respaldarla.`,
            });
          }
          continue;
        }
        // Venta parcialmente respaldada (ej: vendio 10 pero solo quedaban 5
        // tras borrar una compra vieja): antes se truncaba en silencio a lo
        // disponible, perdiendo el resto de la ganancia/perdida realizada sin
        // avisar que la venta quedo inconsistente con el historial de compras.
        if (solicitada > q) {
          warnings.push({
            activoId: a.id,
            ventaId: v.id,
            message: `Venta del ${v.fecha} de ${a.nombre} vendió ${solicitada} pero solo había ${q} disponibles: la diferencia no se contabilizó.`,
          });
        }
        const pMedioUSDAntes = costoUSD / cantidad;
        const pMedioARSAntes = costoARS / cantidad;
        realizadaUSD += (usd - pMedioUSDAntes) * q;
        cantidad -= q;
        costoUSD -= pMedioUSDAntes * q;
        costoARS -= pMedioARSAntes * q;
      }
    }

    const pMedioUSD = cantidad > 0 ? costoUSD / cantidad : 0;
    const pMedioARS = cantidad > 0 ? costoARS / cantidad : 0;

    const pActualUSD = Number(a.valor_actual_usd || pMedioUSD);
    const pActualARS = pActualUSD * tcActual;
    const valorUSD = cantidad * pActualUSD;
    const valorARS = valorUSD * tcActual;

    const deltaPct = pMedioUSD > 0 ? (pActualUSD - pMedioUSD) / pMedioUSD : 0;
    const dias = primera ? Math.max(1, Math.floor((today - new Date(`${primera}T00:00:00`).getTime()) / 86400000)) : 0;
    const tAnual = dias > 0 && pMedioUSD > 0 && 1 + deltaPct > 0 ? Math.pow(1 + deltaPct, 365 / dias) - 1 : 0;

    const divUSDTotal = ds.reduce((s, d) => s + Number(d.monto_usd), 0);
    const cutoff = today - 365 * 86400000;
    const divUSD365 = ds.filter((d) => new Date(`${d.fecha}T00:00:00`).getTime() >= cutoff).reduce((s, d) => s + Number(d.monto_usd), 0);
    const dyPct = valorUSD > 0 ? divUSD365 / valorUSD : 0;

    rows.push({
      activo: a, cantidad, totalCompradoUSD, totalCompradoARS,
      pMedioUSD, pMedioARS, pActualUSD, pActualARS, valorUSD, valorARS,
      deltaPct, tAnual, dias, primeraCompra: primera,
      divUSDTotal, divUSD365, dyPct, realizadaUSD, pctPortfolio: 0,
    });
  }

  const totalValor = rows.reduce((s, r) => s + r.valorUSD, 0);
  for (const r of rows) r.pctPortfolio = totalValor > 0 ? r.valorUSD / totalValor : 0;

  return { rows: rows.sort((a, b) => b.valorUSD - a.valorUSD), warnings };
}

export function formatPct(n: number, digits = 1) {
  if (!isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}
