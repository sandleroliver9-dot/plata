import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, Search, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { categoriasQuery } from "@/lib/queries";
import { formatMoney, currentFinancialMonth, installmentForFinancialMonth, listFinancialMonths } from "@/lib/finance";
import { hasSimilarMovement, isCardInstallmentRecorded } from "@/lib/financial-centers";
import { useDefaultFinancialMonth } from "@/lib/financial-preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovimientoDialog, type Form as MovimientoDefaults } from "@/components/app/movimiento-dialog";
import { QuickEntryDialog } from "@/components/app/quick-entry-dialog";
import { CsvImportDialog } from "@/components/app/csv-import-dialog";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/movimientos")({
  head: () => ({ meta: [{ title: "Movimientos · Platium" }] }),
  component: MovimientosPage,
});

function MovimientosPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const mesActual = currentFinancialMonth(payDay);

  const [openNew, setOpenNew] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openQuickEntry, setOpenQuickEntry] = useState(false);
  const [quickEntryDefaults, setQuickEntryDefaults] = useState<Partial<MovimientoDefaults> | undefined>(undefined);
  const [mes, setMes] = useDefaultFinancialMonth(payDay);
  const [tipo, setTipo] = useState("todos");
  const [search, setSearch] = useState("");

  const meses = listFinancialMonths(payDay, 12, 1);

  const { data: movs, isLoading } = useQuery({
    queryKey: ["movimientos", user?.id, mes],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .eq("mes_financiero", mes)
        .eq("activo", true)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cuotasActivas } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarjetas_cuotas")
        .select("id, tarjeta, compra, valor_cuota, cuota_actual, cuotas_totales, inicio")
        .eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: gastosFijos } = useQuery({
    queryKey: ["gastos-fijos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gastos_fijos")
        .select("id, gasto, monto_mensual, categoria, medio")
        .eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cats } = useQuery(categoriasQuery(user?.id));

  const movimientosConCuotas = useMemo(() => {
    const base = movs ?? [];
    const cuotasComoMovimientos = (cuotasActivas ?? []).flatMap((c) => {
      const cuotaDelMes = installmentForFinancialMonth({
        inicio: c.inicio,
        cuotaActual: Number(c.cuota_actual),
        cuotasTotales: Number(c.cuotas_totales),
        mesFinanciero: mes,
        payDay,
      });
      if (!cuotaDelMes) return [];
      if (isCardInstallmentRecorded(base, mes, { tarjeta: c.tarjeta, compra: c.compra, cuotaOrigenId: c.id })) return [];
      return [{
        id: `cuota-${c.id}-${mes}`,
        tipo: "Gasto",
        descripcion: `${c.compra} (cuota ${cuotaDelMes}/${c.cuotas_totales})`,
        monto: Number(c.valor_cuota),
        fecha: c.inicio,
        mes_financiero: mes,
        categoria: "Tarjeta",
        medio: "Crédito",
        tarjeta: c.tarjeta,
        es_cuota: true,
        cuota_origen_id: c.id,
        activo: true,
      }];
    });
    // Los gastos fijos son la configuración *actual* del usuario: solo tiene sentido
    // proyectarlos como gasto estimado del mes financiero en curso, nunca de meses
    // pasados o futuros que el usuario elija en el selector (esos gastos, si existieron,
    // ya deberían estar cargados como movimientos reales).
    const fijosComoMovimientos = mes !== mesActual ? [] : (gastosFijos ?? [])
      // Si el usuario ya cargo este gasto fijo como movimiento real este mes
      // (lo esperable una vez que lo paga), no duplicarlo con la fila
      // sintetica: sin este chequeo (que Dashboard si tiene via
      // isCardInstallmentRecorded/hasSimilarMovement) el total de gastos y el
      // grafico de categorias contaban el mismo gasto dos veces.
      .filter((g) => !hasSimilarMovement(base as any, g.gasto, Number(g.monto_mensual), mes))
      .map((g) => ({
      id: `fijo-${g.id}-${mes}`,
      tipo: "Gasto",
      descripcion: g.gasto,
      monto: Number(g.monto_mensual),
      fecha: mes,
      mes_financiero: mes,
      categoria: g.categoria ?? "Fijo",
      medio: g.medio,
      tarjeta: null,
      es_cuota: false,
      cuota_origen_id: null,
      activo: true,
      es_fijo: true,
    }));
    return [...base, ...cuotasComoMovimientos, ...fijosComoMovimientos];
  }, [movs, cuotasActivas, gastosFijos, mes, mesActual]);

  const filtered = useMemo(() => {
    return movimientosConCuotas.filter(m => {
      if (tipo !== "todos" && m.tipo !== tipo) return false;
      if (search && !(m.descripcion ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [movimientosConCuotas, tipo, search]);

  const totales = useMemo(() => {
    const ing = filtered.filter(m => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0);
    const gas = filtered.filter(m => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0);
    return { ing, gas, balance: ing - gas };
  }, [filtered]);

  const catColor = (nombre: string | null) => cats?.find((c: any) => c.nombre === nombre)?.color ?? "#64748b";

  const gastosPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movimientosConCuotas) {
      if (m.tipo !== "Gasto") continue;
      const k = m.categoria ?? "Sin categoría";
      map.set(k, (map.get(k) ?? 0) + Number(m.monto));
    }
    return Array.from(map, ([name, value]) => ({ name, value, color: catColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [movimientosConCuotas, cats]);

  const delMut = useMutation({
    mutationFn: async (m: { id: string; ingreso_id?: string | null }) => {
      // Si este movimiento es el espejo de un ingreso (ver migracion
      // add_ingreso_id_to_movimientos), borrarlo solo de aca dejaba el
      // ingreso original activo: reaparecia en el total de la pantalla
      // Ingresos y en getBaseMonthlyIncome aunque el usuario lo haya
      // "eliminado" desde Movimientos. Usar la misma RPC atomica da de baja
      // ambas filas juntas.
      if (m.ingreso_id) {
        if (!user) throw new Error();
        const { error } = await supabase.rpc("delete_income_with_movement", {
          p_user_id: user.id,
          p_ingreso_id: m.ingreso_id,
        });
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("movimientos").update({ activo: false }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresos y gastos de cada mes financiero.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenImport(true)}><Upload className="size-4 mr-2" />Importar CSV</Button>
          <ExportCsvButton userId={user?.id} />
          <Button variant="outline" onClick={() => setOpenQuickEntry(true)}><Sparkles className="size-4 mr-2" />Carga rápida</Button>
          <Button onClick={() => setOpenNew(true)}><Plus className="size-4 mr-2" />Nuevo</Button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Ingresos" value={formatMoney(totales.ing, currency)} tone="success" />
        <MiniStat label="Gastos" value={formatMoney(totales.gas, currency)} tone="destructive" />
        <MiniStat label="Balance" value={formatMoney(totales.balance, currency)} tone={totales.balance >= 0 ? "success" : "destructive"} />
      </div>

      {gastosPorCategoria.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">En qué estás gastando</h2>
            <span className="text-xs text-muted-foreground">{mes}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gastosPorCategoria} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {gastosPorCategoria.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-auto pr-1">
              {gastosPorCategoria.map((e) => {
                const pct = totales.gas > 0 ? (e.value / totales.gas) * 100 : 0;
                return (
                  <div key={e.name} className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="flex-1 truncate">{e.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{pct.toFixed(0)}%</span>
                    <span className="num font-medium tabular-nums">{formatMoney(e.value, currency)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-3 flex flex-wrap gap-2">
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{meses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Ingreso">Ingresos</SelectItem>
            <SelectItem value="Gasto">Gastos</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar descripción..." className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">No hay movimientos para este filtro.</p>
            <Button variant="link" onClick={() => setOpenNew(true)}>Agregar el primero →</Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-muted/20">
                <div className="size-2 rounded-full shrink-0" style={{ background: catColor(m.categoria) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{m.descripcion ?? "(sin descripción)"}</span>
                    {m.es_cuota && <Badge variant="secondary" className="text-xs">Cuota</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-0.5">
                    <span>{m.fecha}</span>
                    {m.categoria && <span>· {m.categoria}</span>}
                    {m.medio && <span>· {m.medio}</span>}
                  </div>
                </div>
                <div className={`num font-semibold whitespace-nowrap ${m.tipo === "Ingreso" ? "text-success" : "text-foreground"}`}>
                  {m.tipo === "Ingreso" ? "+" : "-"}{formatMoney(Number(m.monto), currency)}
                </div>
                {!String(m.id).startsWith("cuota-") && !String(m.id).startsWith("fijo-") && (
                  <ConfirmDeleteButton
                    title="¿Eliminar este movimiento?"
                    description={`${m.descripcion ?? "Este movimiento"} por ${formatMoney(Number(m.monto), currency)} se va a borrar.`}
                    onConfirm={() => delMut.mutate({ id: m.id, ingreso_id: (m as any).ingreso_id })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <MovimientoDialog
        open={openNew}
        onOpenChange={(o) => {
          setOpenNew(o);
          if (!o) setQuickEntryDefaults(undefined);
        }}
        defaults={quickEntryDefaults}
      />
      <CsvImportDialog open={openImport} onOpenChange={setOpenImport} />
      <QuickEntryDialog
        open={openQuickEntry}
        onOpenChange={setOpenQuickEntry}
        categorias={(cats ?? []).map((c: any) => c.nombre)}
        onParsed={(defaults) => {
          setQuickEntryDefaults(defaults);
          setOpenQuickEntry(false);
          setOpenNew(true);
        }}
      />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "success" | "destructive" }) {
  return (
    <Card className="p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`num text-xl font-bold mt-1 ${tone === "success" ? "text-success" : ""}`}>{value}</div>
    </Card>
  );
}

// Exporta TODOS los movimientos activos del usuario (no solo el mes
// financiero seleccionado): es un backup de todo lo cargado, no una
// exportación parcial que dependa de qué mes esté mirando en ese momento.
// Mismas columnas que espera CsvImportDialog, para que el archivo se pueda
// volver a importar sin transformarlo.
function ExportCsvButton({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("movimientos")
      .select("fecha, descripcion, monto, tipo, categoria, medio")
      .eq("user_id", userId)
      .eq("activo", true)
      .order("fecha", { ascending: false });
    setLoading(false);
    if (error) { toast.error("No pude exportar tus movimientos"); return; }
    if (!data || data.length === 0) { toast.info("Todavía no tenés movimientos para exportar"); return; }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plata-movimientos-${todayISO()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${data.length} movimientos exportados`);
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="size-4 mr-2" />{loading ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
