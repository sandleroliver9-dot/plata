import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo, useEffect } from "react";
import { Plus, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatMoney, resolveTC } from "@/lib/finance";
import { getCryptoQuotes, getStockQuotes, getDolares } from "@/lib/quotes.functions";
import { computeBalance, formatPct, type Activo, type Compra, type Venta, type Dividendo, type BalanceRow } from "@/lib/portfolio";
import { MercadoWidget } from "@/components/app/mercado-widget";
import { parseOptionalNumberInput, parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/inversiones")({
  head: () => ({ meta: [{ title: "Inversiones · Plata" }] }),
  component: Inversiones,
});

const TIPOS = ["Cripto", "Acción", "CEDEAR", "ETF", "FCI", "Bono", "Plazo Fijo", "Otro"];
const CRYPTO_TIPOS = new Set(["Cripto"]);
const STOCK_TIPOS = new Set(["Acción", "CEDEAR", "ETF"]);

function Inversiones() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const cryptoFn = useServerFn(getCryptoQuotes);
  const stockFn = useServerFn(getStockQuotes);
  const dolarFn = useServerFn(getDolares);

  const { data: activos } = useQuery({
    queryKey: ["inv-activos", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("inversiones_activos").select("*").eq("activo", true).order("nombre");
      if (error) throw error;
      return (data ?? []) as Activo[];
    },
  });
  const { data: compras } = useQuery({
    queryKey: ["inv-compras", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("inversiones_compras").select("*").order("fecha", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Compra[];
    },
  });
  const { data: ventas } = useQuery({
    queryKey: ["inv-ventas", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("inversiones_ventas").select("*").order("fecha", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Venta[];
    },
  });
  const { data: dividendos } = useQuery({
    queryKey: ["inv-divs", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("inversiones_dividendos").select("*").order("fecha", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Dividendo[];
    },
  });
  const { data: dolar } = useQuery({
    queryKey: ["dolares"], queryFn: () => dolarFn(),
    staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false,
  });

  const { tc, isFallback: tcIsFallback } = resolveTC(dolar);

  const { rows, warnings } = useMemo(() => {
    if (!activos) return { rows: [] as BalanceRow[], warnings: [] };
    const result = computeBalance(activos, compras ?? [], ventas ?? [], dividendos ?? [], tc);
    return { rows: result.rows.filter(r => r.cantidad > 0.000001), warnings: result.warnings };
  }, [activos, compras, ventas, dividendos, tc]);

  useEffect(() => {
    // Antes una venta sin tenencia disponible (ej: se borró la compra que la
    // respaldaba) se ignoraba en silencio en el cálculo de balance.
    if (warnings.length > 0) {
      toast.warning(`${warnings.length === 1 ? "Hay una venta" : `Hay ${warnings.length} ventas`} sin compra que la respalde. Revisá la sección Ventas.`);
    }
  }, [warnings]);

  const totals = useMemo(() => {
    const invertidoUSD = rows.reduce((s, r) => s + r.cantidad * r.pMedioUSD, 0);
    const valorUSD = rows.reduce((s, r) => s + r.valorUSD, 0);
    const noRealizadaUSD = valorUSD - invertidoUSD;
    const realizadaUSD = rows.reduce((s, r) => s + r.realizadaUSD, 0);
    const divUSD = rows.reduce((s, r) => s + r.divUSDTotal, 0);
    return { invertidoUSD, valorUSD, noRealizadaUSD, realizadaUSD, divUSD };
  }, [rows]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["inv-activos"] });
    qc.invalidateQueries({ queryKey: ["inv-compras"] });
    qc.invalidateQueries({ queryKey: ["inv-ventas"] });
    qc.invalidateQueries({ queryKey: ["inv-divs"] });
  };

  async function refreshPrices() {
    if (!activos || activos.length === 0) return;
    const cryptoTickers = activos.filter(a => CRYPTO_TIPOS.has(a.tipo) && a.ticker).map(a => a.ticker!);
    const stockTickers = activos.filter(a => STOCK_TIPOS.has(a.tipo) && a.ticker).map(a => a.ticker!);
    if (cryptoTickers.length === 0 && stockTickers.length === 0) {
      toast.info("Cargá ticker a los activos para poder actualizar.");
      return;
    }
    toast.loading("Actualizando cotizaciones...", { id: "prices" });
    const [cQ, sQ] = await Promise.all([
      cryptoTickers.length ? cryptoFn({ data: { tickers: cryptoTickers } }) : Promise.resolve([]),
      stockTickers.length ? stockFn({ data: { tickers: stockTickers } }) : Promise.resolve([]),
    ]);
    let updated = 0;
    const now = new Date().toISOString();
    for (const a of activos) {
      if (!a.ticker) continue;
      let price: number | undefined;
      if (CRYPTO_TIPOS.has(a.tipo)) price = cQ.find(q => q.symbol === a.ticker!.toUpperCase())?.usd;
      else if (STOCK_TIPOS.has(a.tipo)) price = sQ.find(q => q.symbol === a.ticker!.toUpperCase())?.usd;
      if (price && price > 0) {
        await supabase.from("inversiones_activos").update({ valor_actual_usd: price, precio_actualizado_en: now }).eq("id", a.id);
        updated++;
      }
    }
    qc.invalidateQueries({ queryKey: ["inv-activos"] });
    toast.success(`${updated} cotizaciones actualizadas`, { id: "prices" });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inversiones</h1>
          <p className="text-muted-foreground text-sm">Portfolio con compras, ventas y dividendos.</p>
          {tcIsFallback && (
            <p className="text-xs text-warning mt-1">
              No se pudo obtener la cotización del dólar del día: los montos en ARS usan un tipo de cambio de referencia y pueden no ser exactos.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshPrices}><RefreshCw className="size-4 mr-2" />Actualizar precios</Button>
          <NuevoActivoDialog userId={user?.id} onCreated={invalidate} />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Invertido" usd={totals.invertidoUSD} tc={tc} />
        <KPI label="Valor actual" usd={totals.valorUSD} tc={tc} />
        <KPI label="G/P no realizada" usd={totals.noRealizadaUSD} tc={tc} signed />
        <KPI label="G/P realizada + Divs" usd={totals.realizadaUSD + totals.divUSD} tc={tc} signed />
      </div>

      <MercadoWidget />



      <Tabs defaultValue="balance">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="dividendos">Dividendos</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4">
          <BalanceTable rows={rows} />
        </TabsContent>
        <TabsContent value="compras" className="mt-4">
          <CompraSection activos={activos ?? []} compras={compras ?? []} userId={user?.id} tc={tc} onChange={invalidate} />
        </TabsContent>
        <TabsContent value="ventas" className="mt-4">
          <VentaSection activos={activos ?? []} rows={rows} ventas={ventas ?? []} userId={user?.id} tc={tc} onChange={invalidate} />
        </TabsContent>
        <TabsContent value="dividendos" className="mt-4">
          <DivSection activos={activos ?? []} divs={dividendos ?? []} userId={user?.id} tc={tc} onChange={invalidate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, usd, tc, signed }: { label: string; usd: number; tc: number; signed?: boolean }) {
  const cls = signed ? (usd >= 0 ? "text-success" : "text-destructive") : "";
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`num text-xl font-bold mt-1 ${cls}`}>{formatMoney(usd, "USD")}</div>
      <div className={`num text-xs text-muted-foreground mt-0.5 ${cls}`}>{formatMoney(usd * tc, "ARS")}</div>
    </Card>
  );
}

function BalanceTable({ rows }: { rows: BalanceRow[] }) {
  if (rows.length === 0) {
    return <Card className="p-10 text-center text-muted-foreground">Cargá una compra para empezar.</Card>;
  }
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Q</TableHead>
              <TableHead className="text-right">PMedio USD</TableHead>
              <TableHead className="text-right">PActual USD</TableHead>
              <TableHead className="text-right">Δ%</TableHead>
              <TableHead className="text-right">T.anual</TableHead>
              <TableHead className="text-right">Valor USD</TableHead>
              <TableHead className="text-right">Valor ARS</TableHead>
              <TableHead className="text-right">% Port</TableHead>
              <TableHead className="text-right">Días</TableHead>
              <TableHead className="text-right">Div USD</TableHead>
              <TableHead className="text-right">DY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.activo.id}>
                <TableCell>
                  <div className="font-medium">{r.activo.nombre}</div>
                  {r.activo.ticker && <div className="text-xs text-muted-foreground">{r.activo.ticker}</div>}
                </TableCell>
                <TableCell><Badge variant="secondary">{r.activo.tipo}</Badge></TableCell>
                <TableCell className="text-right num">{r.cantidad.toLocaleString("es-AR", { maximumFractionDigits: 4 })}</TableCell>
                <TableCell className="text-right num">{formatMoney(r.pMedioUSD, "USD")}</TableCell>
                <TableCell className="text-right num">{formatMoney(r.pActualUSD, "USD")}</TableCell>
                <TableCell className={`text-right num ${r.deltaPct >= 0 ? "text-success" : "text-destructive"}`}>{formatPct(r.deltaPct)}</TableCell>
                <TableCell className={`text-right num ${r.tAnual >= 0 ? "text-success" : "text-destructive"}`}>{formatPct(r.tAnual)}</TableCell>
                <TableCell className="text-right num font-medium">{formatMoney(r.valorUSD, "USD")}</TableCell>
                <TableCell className="text-right num text-muted-foreground">{formatMoney(r.valorARS, "ARS")}</TableCell>
                <TableCell className="text-right num">{formatPct(r.pctPortfolio, 1)}</TableCell>
                <TableCell className="text-right num">{r.dias}</TableCell>
                <TableCell className="text-right num">{formatMoney(r.divUSDTotal, "USD")}</TableCell>
                <TableCell className="text-right num">{formatPct(r.dyPct)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* ---------- Activo dialog ---------- */
function NuevoActivoDialog({ userId, onCreated }: { userId?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", ticker: "", tipo: "Acción", sector: "" });

  async function save() {
    if (!userId) return;
    if (!form.nombre) { toast.error("Falta el nombre"); return; }
    const { error } = await supabase.from("inversiones_activos").insert({
      user_id: userId, nombre: form.nombre, ticker: form.ticker || null,
      tipo: form.tipo, sector: form.sector || null, moneda_base: "USD",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Activo creado");
    setForm({ nombre: "", ticker: "", tipo: "Acción", sector: "" });
    setOpen(false); onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="secondary"><Plus className="size-4 mr-2" />Nuevo activo</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo activo</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Nombre *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Apple, Bitcoin, SPY..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ticker</Label><Input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })} placeholder="AAPL, BTC, SPY" /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Sector</Label><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Tech, Energía, etc." /></div>
        </div>
        <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Compras ---------- */
function CompraSection({ activos, compras, userId, tc, onChange }: { activos: Activo[]; compras: Compra[]; userId?: string; tc: number; onChange: () => void }) {
  const activoById = useMemo(() => new Map(activos.map(a => [a.id, a])), [activos]);
  async function del(id: string) {
    const { error } = await supabase.from("inversiones_compras").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Compra eliminada"); onChange();
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><MovDialog kind="compra" activos={activos} userId={userId} tc={tc} onCreated={onChange} /></div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Fecha</TableHead><TableHead>Activo</TableHead>
              <TableHead className="text-right">Q</TableHead>
              <TableHead className="text-right">Precio USD</TableHead>
              <TableHead className="text-right">TC</TableHead>
              <TableHead className="text-right">Total USD</TableHead>
              <TableHead className="text-right">Total ARS</TableHead>
              <TableHead>Broker</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {compras.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Sin compras.</TableCell></TableRow>}
              {compras.map((c) => {
                const a = activoById.get(c.activo_id);
                const totalUSD = Number(c.cantidad) * Number(c.precio_usd);
                const totalARS = totalUSD * Number(c.tc || tc);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{c.fecha}</TableCell>
                    <TableCell>{a?.nombre ?? "—"} {a?.ticker && <span className="text-xs text-muted-foreground">({a.ticker})</span>}</TableCell>
                    <TableCell className="text-right num">{Number(c.cantidad)}</TableCell>
                    <TableCell className="text-right num">{formatMoney(Number(c.precio_usd), "USD")}</TableCell>
                    <TableCell className="text-right num text-muted-foreground">{c.tc ? Number(c.tc).toFixed(0) : "—"}</TableCell>
                    <TableCell className="text-right num">{formatMoney(totalUSD, "USD")}</TableCell>
                    <TableCell className="text-right num text-muted-foreground">{formatMoney(totalARS, "ARS")}</TableCell>
                    <TableCell className="text-xs">{c.broker ?? "—"}</TableCell>
                    <TableCell>
                      <ConfirmDeleteButton
                        size="sm"
                        title="¿Eliminar esta compra?"
                        description={`Compra de ${a?.nombre ?? "este activo"} del ${c.fecha} se va a borrar.`}
                        onConfirm={() => del(c.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Ventas ---------- */
function VentaSection({ activos, rows, ventas, userId, tc, onChange }: { activos: Activo[]; rows: BalanceRow[]; ventas: Venta[]; userId?: string; tc: number; onChange: () => void }) {
  const activoById = useMemo(() => new Map(activos.map(a => [a.id, a])), [activos]);
  const rowById = useMemo(() => new Map(rows.map(r => [r.activo.id, r])), [rows]);
  async function del(id: string) {
    const { error } = await supabase.from("inversiones_ventas").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Venta eliminada"); onChange();
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><MovDialog kind="venta" activos={activos} userId={userId} tc={tc} rows={rows} onCreated={onChange} /></div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Fecha</TableHead><TableHead>Activo</TableHead>
              <TableHead className="text-right">Q</TableHead>
              <TableHead className="text-right">P. venta USD</TableHead>
              <TableHead className="text-right">PMedio USD</TableHead>
              <TableHead className="text-right">G/P USD</TableHead>
              <TableHead className="text-right">Total USD</TableHead>
              <TableHead className="text-right">Total ARS</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {ventas.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Sin ventas.</TableCell></TableRow>}
              {ventas.map((v) => {
                const a = activoById.get(v.activo_id);
                const r = rowById.get(v.activo_id);
                const pMed = r?.pMedioUSD ?? 0;
                const gp = (Number(v.precio_usd) - pMed) * Number(v.cantidad);
                const totalUSD = Number(v.cantidad) * Number(v.precio_usd);
                const totalARS = totalUSD * Number(v.tc || tc);
                return (
                  <TableRow key={v.id}>
                    <TableCell className="text-xs">{v.fecha}</TableCell>
                    <TableCell>{a?.nombre ?? "—"} {a?.ticker && <span className="text-xs text-muted-foreground">({a.ticker})</span>}</TableCell>
                    <TableCell className="text-right num">{Number(v.cantidad)}</TableCell>
                    <TableCell className="text-right num">{formatMoney(Number(v.precio_usd), "USD")}</TableCell>
                    <TableCell className="text-right num text-muted-foreground">{formatMoney(pMed, "USD")}</TableCell>
                    <TableCell className={`text-right num ${gp >= 0 ? "text-success" : "text-destructive"}`}>{formatMoney(gp, "USD")}</TableCell>
                    <TableCell className="text-right num">{formatMoney(totalUSD, "USD")}</TableCell>
                    <TableCell className="text-right num text-muted-foreground">{formatMoney(totalARS, "ARS")}</TableCell>
                    <TableCell>
                      <ConfirmDeleteButton
                        size="sm"
                        title="¿Eliminar esta venta?"
                        description={`Venta de ${a?.nombre ?? "este activo"} del ${v.fecha} se va a borrar.`}
                        onConfirm={() => del(v.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Dividendos ---------- */
function DivSection({ activos, divs, userId, tc, onChange }: { activos: Activo[]; divs: Dividendo[]; userId?: string; tc: number; onChange: () => void }) {
  const activoById = useMemo(() => new Map(activos.map(a => [a.id, a])), [activos]);
  async function del(id: string) {
    const { error } = await supabase.from("inversiones_dividendos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Dividendo eliminado"); onChange();
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><MovDialog kind="dividendo" activos={activos} userId={userId} tc={tc} onCreated={onChange} /></div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Fecha</TableHead><TableHead>Activo</TableHead>
              <TableHead className="text-right">Monto USD</TableHead>
              <TableHead className="text-right">Monto ARS</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {divs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin dividendos cobrados.</TableCell></TableRow>}
              {divs.map((d) => {
                const a = activoById.get(d.activo_id);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{d.fecha}</TableCell>
                    <TableCell>{a?.nombre ?? "—"} {a?.ticker && <span className="text-xs text-muted-foreground">({a.ticker})</span>}</TableCell>
                    <TableCell className="text-right num">{formatMoney(Number(d.monto_usd), "USD")}</TableCell>
                    <TableCell className="text-right num text-muted-foreground">{formatMoney(Number(d.monto_usd) * Number(d.tc || tc), "ARS")}</TableCell>
                    <TableCell>
                      <ConfirmDeleteButton
                        size="sm"
                        title="¿Eliminar este dividendo?"
                        description={`Dividendo de ${a?.nombre ?? "este activo"} del ${d.fecha} se va a borrar.`}
                        onConfirm={() => del(d.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Universal mov dialog ---------- */
function MovDialog({ kind, activos, userId, tc, rows, onCreated }: { kind: "compra" | "venta" | "dividendo"; activos: Activo[]; userId?: string; tc: number; rows?: BalanceRow[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ activo_id: "", fecha: today, cantidad: "", precio: "", monto: "", tc: tc ? String(Math.round(tc)) : "", broker: "" });

  const titles = { compra: "Nueva compra", venta: "Nueva venta", dividendo: "Nuevo dividendo" };
  const opts = kind === "venta" ? activos.filter(a => (rows ?? []).some(r => r.activo.id === a.id && r.cantidad > 0)) : activos;
  const selected = activos.find(a => a.id === form.activo_id);
  const qDisponible = kind === "venta" ? (rows ?? []).find(r => r.activo.id === form.activo_id)?.cantidad ?? 0 : null;

  async function save() {
    if (!userId || !form.activo_id) { toast.error("Elegí un activo"); return; }
    let tcNum: number | null;
    try {
      tcNum = form.tc ? parseOptionalNumberInput(form.tc, 0) : null;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    if (kind === "dividendo") {
      if (!form.monto) { toast.error("Completá el monto"); return; }
      let monto: number;
      try {
        monto = parsePositiveNumberInput(form.monto, "Monto");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Revisa el monto");
        return;
      }
      const { error } = await supabase.from("inversiones_dividendos").insert({
        user_id: userId, activo_id: form.activo_id, fecha: form.fecha,
        monto_usd: monto, tc: tcNum,
      });
      if (error) { toast.error(error.message); return; }
    } else {
      if (!form.cantidad || !form.precio) { toast.error("Completá cantidad y precio"); return; }
      let cant: number;
      let precio: number;
      try {
        cant = parsePositiveNumberInput(form.cantidad, "Cantidad");
        precio = parsePositiveNumberInput(form.precio, "Precio");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Revisa los numeros");
        return;
      }
      if (kind === "venta" && qDisponible != null && cant > qDisponible + 0.000001) {
        toast.error(`No podés vender más de ${qDisponible}`); return;
      }
      const table = kind === "compra" ? "inversiones_compras" : "inversiones_ventas";
      const payload: any = {
        user_id: userId, activo_id: form.activo_id, fecha: form.fecha,
        cantidad: cant, precio_usd: precio, tc: tcNum,
      };
      if (kind === "compra") payload.broker = form.broker || null;
      const { error } = await supabase.from(table).insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Guardado");
    setForm({ activo_id: "", fecha: today, cantidad: "", precio: "", monto: "", tc: tc ? String(Math.round(tc)) : "", broker: "" });
    setOpen(false); onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4 mr-2" />{kind === "compra" ? "Nueva compra" : kind === "venta" ? "Nueva venta" : "Nuevo dividendo"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{titles[kind]}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Activo *</Label>
            <Select value={form.activo_id} onValueChange={(v) => setForm({ ...form, activo_id: v })}>
              <SelectTrigger><SelectValue placeholder={opts.length ? "Elegí" : "Creá un activo primero"} /></SelectTrigger>
              <SelectContent>{opts.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}{a.ticker ? ` (${a.ticker})` : ""}</SelectItem>)}</SelectContent>
            </Select>
            {qDisponible != null && selected && <div className="text-xs text-muted-foreground mt-1">Disponible: {qDisponible}</div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
            <div><Label>TC ARS/USD</Label><DecimalInput value={form.tc} onChange={(e) => setForm({ ...form, tc: e.target.value })} placeholder="MEP del día" /></div>
          </div>
          {kind === "dividendo" ? (
            <div><Label>Monto USD *</Label><DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 25,50" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cantidad *</Label><DecimalInput value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="Ej: 2,5" /></div>
              <div><Label>Precio USD *</Label><DecimalInput value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="Ej: 180,25" /></div>
            </div>
          )}
          {kind === "compra" && <div><Label>Broker</Label><Input value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} /></div>}
        </div>
        <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Silence unused import warning when icons removed
void TrendingUp; void TrendingDown;
