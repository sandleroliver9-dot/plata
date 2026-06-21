import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CflJmRts.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, a as parseOptionalNumberInput, b as parsePositiveNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, f as DialogFooter } from "./dialog-VpbuoPd_.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { a as getStockQuotes, b as getCryptoQuotes, c as getDolares } from "./quotes.functions-C3guMtfB.mjs";
import "../_libs/seroval.mjs";
import { R as RefreshCw, P as Plus, p as Activity, n as TrendingUp, q as TrendingDown, l as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-BjmrHUg4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
const Table = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { ref, className: cn("w-full caption-bottom text-sm", className), ...props }) })
);
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props }));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tr",
    {
      ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }));
TableCaption.displayName = "TableCaption";
function computeBalance(activos, compras, ventas, dividendos, tcActual) {
  const today = Date.now();
  const rows = [];
  for (const a of activos) {
    const cs = compras.filter((c) => c.activo_id === a.id);
    const vs = ventas.filter((v) => v.activo_id === a.id);
    const ds = dividendos.filter((d) => d.activo_id === a.id);
    const events = [
      ...cs.map((c) => ({ kind: "compra", fecha: c.fecha, row: c })),
      ...vs.map((v) => ({ kind: "venta", fecha: v.fecha, row: v }))
    ].sort((x, y) => x.fecha.localeCompare(y.fecha) || (x.kind === "compra" ? -1 : 1));
    let cantidad = 0;
    let costoUSD = 0;
    let costoARS = 0;
    let realizadaUSD = 0;
    let totalCompradoUSD = 0;
    let totalCompradoARS = 0;
    let primera = null;
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
        const q = Math.max(0, Math.min(Number(v.cantidad), cantidad));
        const usd = Math.max(0, Number(v.precio_usd));
        if (q <= 0 || usd <= 0 || cantidad <= 0) continue;
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
    const dias = primera ? Math.max(1, Math.floor((today - (/* @__PURE__ */ new Date(`${primera}T00:00:00`)).getTime()) / 864e5)) : 0;
    const tAnual = dias > 0 && pMedioUSD > 0 && 1 + deltaPct > 0 ? Math.pow(1 + deltaPct, 365 / dias) - 1 : 0;
    const divUSDTotal = ds.reduce((s, d) => s + Number(d.monto_usd), 0);
    const cutoff = today - 365 * 864e5;
    const divUSD365 = ds.filter((d) => (/* @__PURE__ */ new Date(`${d.fecha}T00:00:00`)).getTime() >= cutoff).reduce((s, d) => s + Number(d.monto_usd), 0);
    const dyPct = valorUSD > 0 ? divUSD365 / valorUSD : 0;
    rows.push({
      activo: a,
      cantidad,
      totalCompradoUSD,
      totalCompradoARS,
      pMedioUSD,
      pMedioARS,
      pActualUSD,
      pActualARS,
      valorUSD,
      valorARS,
      deltaPct,
      tAnual,
      dias,
      primeraCompra: primera,
      divUSDTotal,
      divUSD365,
      dyPct,
      realizadaUSD,
      pctPortfolio: 0
    });
  }
  const totalValor = rows.reduce((s, r) => s + r.valorUSD, 0);
  for (const r of rows) r.pctPortfolio = totalValor > 0 ? r.valorUSD / totalValor : 0;
  return rows.sort((a, b) => b.valorUSD - a.valorUSD);
}
function formatPct(n, digits = 1) {
  if (!isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}
const DEFAULT_STOCKS = ["SPY", "QQQ", "DIA", "^GSPC", "^IXIC", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "KO", "JPM"];
const DEFAULT_CRYPTOS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "LINK", "DOT"];
const LABELS = {
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
  "SPY": "S&P 500 ETF",
  "QQQ": "NASDAQ ETF",
  "DIA": "Dow Jones ETF"
};
function fmtUSD(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 4 : 2 }).format(n);
}
function MercadoWidget() {
  const stockFn = useServerFn(getStockQuotes);
  const cryptoFn = useServerFn(getCryptoQuotes);
  const [customStock, setCustomStock] = reactExports.useState("");
  const [extraStocks, setExtraStocks] = reactExports.useState([]);
  const stockTickers = [...DEFAULT_STOCKS, ...extraStocks];
  const stocks = useQuery({
    queryKey: ["mkt-stocks", stockTickers],
    queryFn: () => stockFn({ data: { tickers: stockTickers } }),
    staleTime: 60 * 1e3,
    refetchInterval: 60 * 1e3,
    refetchOnWindowFocus: false
  });
  const cryptos = useQuery({
    queryKey: ["mkt-cryptos"],
    queryFn: () => cryptoFn({ data: { tickers: DEFAULT_CRYPTOS } }),
    staleTime: 60 * 1e3,
    refetchInterval: 60 * 1e3,
    refetchOnWindowFocus: false
  });
  function addStock(e) {
    e.preventDefault();
    const t = customStock.trim().toUpperCase();
    if (t && !stockTickers.includes(t)) setExtraStocks((s) => [...s, t]);
    setCustomStock("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "size-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Mercado en vivo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
        stocks.refetch();
        cryptos.refetch();
      }, disabled: stocks.isFetching || cryptos.isFetching, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-4 ${stocks.isFetching || cryptos.isFetching ? "animate-spin" : ""}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "acciones", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "acciones", children: "Acciones / ETFs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cripto", children: "Cripto" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "acciones", className: "mt-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: addStock, className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: customStock, onChange: (e) => setCustomStock(e.target.value), placeholder: "Agregar ticker (ej: AMD)", className: "h-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", variant: "secondary", children: "Agregar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2", children: stockTickers.map((t) => {
          const q = stocks.data?.find((x) => x.symbol === t);
          const up = (q?.change ?? 0) >= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-border bg-card/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: LABELS[t] ?? t }),
              q?.change != null && (up ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3 text-success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3 text-destructive" }))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-sm font-bold mt-1", children: fmtUSD(q?.usd) }),
            q?.change != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `num text-xs ${up ? "text-success" : "text-destructive"}`, children: [
              up ? "+" : "",
              q.change.toFixed(2),
              "%"
            ] })
          ] }, t);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cripto", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2", children: DEFAULT_CRYPTOS.map((t) => {
        const q = cryptos.data?.find((x) => x.symbol === t);
        const up = (q?.change24h ?? 0) >= 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-border bg-card/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: t }),
            q?.change24h != null && (up ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3 text-success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3 text-destructive" }))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-sm font-bold mt-1", children: fmtUSD(q?.usd) }),
          q?.change24h != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `num text-xs ${up ? "text-success" : "text-destructive"}`, children: [
            up ? "+" : "",
            q.change24h.toFixed(2),
            "%"
          ] })
        ] }, t);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-3", children: "Actualiza cada 60s. Cripto: CoinGecko · Acciones: Yahoo Finance." })
  ] });
}
const TIPOS = ["Cripto", "Acción", "CEDEAR", "ETF", "FCI", "Bono", "Plazo Fijo", "Otro"];
const CRYPTO_TIPOS = /* @__PURE__ */ new Set(["Cripto"]);
const STOCK_TIPOS = /* @__PURE__ */ new Set(["Acción", "CEDEAR", "ETF"]);
function Inversiones() {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const cryptoFn = useServerFn(getCryptoQuotes);
  const stockFn = useServerFn(getStockQuotes);
  const dolarFn = useServerFn(getDolares);
  const {
    data: activos
  } = useQuery({
    queryKey: ["inv-activos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("inversiones_activos").select("*").eq("activo", true).order("nombre");
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: compras
  } = useQuery({
    queryKey: ["inv-compras", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("inversiones_compras").select("*").order("fecha", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: ventas
  } = useQuery({
    queryKey: ["inv-ventas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("inversiones_ventas").select("*").order("fecha", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: dividendos
  } = useQuery({
    queryKey: ["inv-divs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("inversiones_dividendos").select("*").order("fecha", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: dolar
  } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => dolarFn(),
    staleTime: 5 * 60 * 1e3,
    refetchOnWindowFocus: false
  });
  const tc = dolar?.mep ?? dolar?.ccl ?? dolar?.blue ?? 1e3;
  const rows = reactExports.useMemo(() => {
    if (!activos) return [];
    return computeBalance(activos, compras ?? [], ventas ?? [], dividendos ?? [], tc).filter((r) => r.cantidad > 1e-6);
  }, [activos, compras, ventas, dividendos, tc]);
  const totals = reactExports.useMemo(() => {
    const invertidoUSD = rows.reduce((s, r) => s + r.cantidad * r.pMedioUSD, 0);
    const valorUSD = rows.reduce((s, r) => s + r.valorUSD, 0);
    const noRealizadaUSD = valorUSD - invertidoUSD;
    const realizadaUSD = rows.reduce((s, r) => s + r.realizadaUSD, 0);
    const divUSD = rows.reduce((s, r) => s + r.divUSDTotal, 0);
    return {
      invertidoUSD,
      valorUSD,
      noRealizadaUSD,
      realizadaUSD,
      divUSD
    };
  }, [rows]);
  const invalidate = () => {
    qc.invalidateQueries({
      queryKey: ["inv-activos"]
    });
    qc.invalidateQueries({
      queryKey: ["inv-compras"]
    });
    qc.invalidateQueries({
      queryKey: ["inv-ventas"]
    });
    qc.invalidateQueries({
      queryKey: ["inv-divs"]
    });
  };
  async function refreshPrices() {
    if (!activos || activos.length === 0) return;
    const cryptoTickers = activos.filter((a) => CRYPTO_TIPOS.has(a.tipo) && a.ticker).map((a) => a.ticker);
    const stockTickers = activos.filter((a) => STOCK_TIPOS.has(a.tipo) && a.ticker).map((a) => a.ticker);
    if (cryptoTickers.length === 0 && stockTickers.length === 0) {
      toast.info("Cargá ticker a los activos para poder actualizar.");
      return;
    }
    toast.loading("Actualizando cotizaciones...", {
      id: "prices"
    });
    const [cQ, sQ] = await Promise.all([cryptoTickers.length ? cryptoFn({
      data: {
        tickers: cryptoTickers
      }
    }) : Promise.resolve([]), stockTickers.length ? stockFn({
      data: {
        tickers: stockTickers
      }
    }) : Promise.resolve([])]);
    let updated = 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const a of activos) {
      if (!a.ticker) continue;
      let price;
      if (CRYPTO_TIPOS.has(a.tipo)) price = cQ.find((q) => q.symbol === a.ticker.toUpperCase())?.usd;
      else if (STOCK_TIPOS.has(a.tipo)) price = sQ.find((q) => q.symbol === a.ticker.toUpperCase())?.usd;
      if (price && price > 0) {
        await supabase.from("inversiones_activos").update({
          valor_actual_usd: price,
          precio_actualizado_en: now
        }).eq("id", a.id);
        updated++;
      }
    }
    qc.invalidateQueries({
      queryKey: ["inv-activos"]
    });
    toast.success(`${updated} cotizaciones actualizadas`, {
      id: "prices"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Inversiones" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Portfolio con compras, ventas y dividendos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: refreshPrices, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4 mr-2" }),
          "Actualizar precios"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NuevoActivoDialog, { userId: user?.id, onCreated: invalidate })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { label: "Invertido", usd: totals.invertidoUSD, tc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { label: "Valor actual", usd: totals.valorUSD, tc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { label: "G/P no realizada", usd: totals.noRealizadaUSD, tc, signed: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { label: "G/P realizada + Divs", usd: totals.realizadaUSD + totals.divUSD, tc, signed: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MercadoWidget, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "balance", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-4 w-full max-w-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "balance", children: "Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "compras", children: "Compras" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ventas", children: "Ventas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "dividendos", children: "Dividendos" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "balance", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BalanceTable, { rows }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "compras", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompraSection, { activos: activos ?? [], compras: compras ?? [], userId: user?.id, tc, onChange: invalidate }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ventas", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VentaSection, { activos: activos ?? [], rows, ventas: ventas ?? [], userId: user?.id, tc, onChange: invalidate }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "dividendos", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DivSection, { activos: activos ?? [], divs: dividendos ?? [], userId: user?.id, tc, onChange: invalidate }) })
    ] })
  ] });
}
function KPI({
  label,
  usd,
  tc,
  signed
}) {
  const cls = signed ? usd >= 0 ? "text-success" : "text-destructive" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-xl font-bold mt-1 ${cls}`, children: formatMoney(usd, "USD") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-xs text-muted-foreground mt-0.5 ${cls}`, children: formatMoney(usd * tc, "ARS") })
  ] });
}
function BalanceTable({
  rows
}) {
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Cargá una compra para empezar." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Q" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "PMedio USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "PActual USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Δ%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "T.anual" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Valor USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Valor ARS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "% Port" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Días" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Div USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "DY" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.activo.nombre }),
        r.activo.ticker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: r.activo.ticker })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: r.activo.tipo }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: r.cantidad.toLocaleString("es-AR", {
        maximumFractionDigits: 4
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(r.pMedioUSD, "USD") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(r.pActualUSD, "USD") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `text-right num ${r.deltaPct >= 0 ? "text-success" : "text-destructive"}`, children: formatPct(r.deltaPct) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `text-right num ${r.tAnual >= 0 ? "text-success" : "text-destructive"}`, children: formatPct(r.tAnual) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num font-medium", children: formatMoney(r.valorUSD, "USD") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num text-muted-foreground", children: formatMoney(r.valorARS, "ARS") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatPct(r.pctPortfolio, 1) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: r.dias }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(r.divUSDTotal, "USD") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatPct(r.dyPct) })
    ] }, r.activo.id)) })
  ] }) }) });
}
function NuevoActivoDialog({
  userId,
  onCreated
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    nombre: "",
    ticker: "",
    tipo: "Acción",
    sector: ""
  });
  async function save() {
    if (!userId) return;
    if (!form.nombre) {
      toast.error("Falta el nombre");
      return;
    }
    const {
      error
    } = await supabase.from("inversiones_activos").insert({
      user_id: userId,
      nombre: form.nombre,
      ticker: form.ticker || null,
      tipo: form.tipo,
      sector: form.sector || null,
      moneda_base: "USD"
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Activo creado");
    setForm({
      nombre: "",
      ticker: "",
      tipo: "Acción",
      sector: ""
    });
    setOpen(false);
    onCreated();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
      "Nuevo activo"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo activo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nombre, onChange: (e) => setForm({
            ...form,
            nombre: e.target.value
          }), placeholder: "Apple, Bitcoin, SPY..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ticker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ticker, onChange: (e) => setForm({
              ...form,
              ticker: e.target.value.toUpperCase()
            }), placeholder: "AAPL, BTC, SPY" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tipo, onValueChange: (v) => setForm({
              ...form,
              tipo: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sector" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sector, onChange: (e) => setForm({
            ...form,
            sector: e.target.value
          }), placeholder: "Tech, Energía, etc." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Guardar" }) })
    ] })
  ] });
}
function CompraSection({
  activos,
  compras,
  userId,
  tc,
  onChange
}) {
  const activoById = reactExports.useMemo(() => new Map(activos.map((a) => [a.id, a])), [activos]);
  async function del(id) {
    const {
      error
    } = await supabase.from("inversiones_compras").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compra eliminada");
    onChange();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MovDialog, { kind: "compra", activos, userId, tc, onCreated: onChange }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Q" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Precio USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "TC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total ARS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Broker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        compras.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: "Sin compras." }) }),
        compras.map((c) => {
          const a = activoById.get(c.activo_id);
          const totalUSD = Number(c.cantidad) * Number(c.precio_usd);
          const totalARS = totalUSD * Number(c.tc || tc);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: c.fecha }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              a?.nombre ?? "—",
              " ",
              a?.ticker && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                a.ticker,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: Number(c.cantidad) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(Number(c.precio_usd), "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num text-muted-foreground", children: c.tc ? Number(c.tc).toFixed(0) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(totalUSD, "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num text-muted-foreground", children: formatMoney(totalARS, "ARS") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: c.broker ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => del(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
          ] }, c.id);
        })
      ] })
    ] }) }) })
  ] });
}
function VentaSection({
  activos,
  rows,
  ventas,
  userId,
  tc,
  onChange
}) {
  const activoById = reactExports.useMemo(() => new Map(activos.map((a) => [a.id, a])), [activos]);
  const rowById = reactExports.useMemo(() => new Map(rows.map((r) => [r.activo.id, r])), [rows]);
  async function del(id) {
    const {
      error
    } = await supabase.from("inversiones_ventas").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Venta eliminada");
    onChange();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MovDialog, { kind: "venta", activos, userId, tc, rows, onCreated: onChange }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Q" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "P. venta USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "PMedio USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "G/P USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        ventas.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "Sin ventas." }) }),
        ventas.map((v) => {
          const a = activoById.get(v.activo_id);
          const r = rowById.get(v.activo_id);
          const pMed = r?.pMedioUSD ?? 0;
          const gp = (Number(v.precio_usd) - pMed) * Number(v.cantidad);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: v.fecha }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              a?.nombre ?? "—",
              " ",
              a?.ticker && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                a.ticker,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: Number(v.cantidad) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(Number(v.precio_usd), "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num text-muted-foreground", children: formatMoney(pMed, "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: `text-right num ${gp >= 0 ? "text-success" : "text-destructive"}`, children: formatMoney(gp, "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(Number(v.cantidad) * Number(v.precio_usd), "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => del(v.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
          ] }, v.id);
        })
      ] })
    ] }) }) })
  ] });
}
function DivSection({
  activos,
  divs,
  userId,
  tc,
  onChange
}) {
  const activoById = reactExports.useMemo(() => new Map(activos.map((a) => [a.id, a])), [activos]);
  async function del(id) {
    const {
      error
    } = await supabase.from("inversiones_dividendos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Dividendo eliminado");
    onChange();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MovDialog, { kind: "dividendo", activos, userId, tc, onCreated: onChange }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Activo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Monto USD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Monto ARS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        divs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-8", children: "Sin dividendos cobrados." }) }),
        divs.map((d) => {
          const a = activoById.get(d.activo_id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: d.fecha }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              a?.nombre ?? "—",
              " ",
              a?.ticker && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                a.ticker,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num", children: formatMoney(Number(d.monto_usd), "USD") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right num text-muted-foreground", children: formatMoney(Number(d.monto_usd) * Number(d.tc || tc), "ARS") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => del(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
          ] }, d.id);
        })
      ] })
    ] }) }) })
  ] });
}
function MovDialog({
  kind,
  activos,
  userId,
  tc,
  rows,
  onCreated
}) {
  const [open, setOpen] = reactExports.useState(false);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [form, setForm] = reactExports.useState({
    activo_id: "",
    fecha: today,
    cantidad: "",
    precio: "",
    monto: "",
    tc: tc ? String(Math.round(tc)) : "",
    broker: ""
  });
  const titles = {
    compra: "Nueva compra",
    venta: "Nueva venta",
    dividendo: "Nuevo dividendo"
  };
  const opts = kind === "venta" ? activos.filter((a) => (rows ?? []).some((r) => r.activo.id === a.id && r.cantidad > 0)) : activos;
  const selected = activos.find((a) => a.id === form.activo_id);
  const qDisponible = kind === "venta" ? (rows ?? []).find((r) => r.activo.id === form.activo_id)?.cantidad ?? 0 : null;
  async function save() {
    if (!userId || !form.activo_id) {
      toast.error("Elegí un activo");
      return;
    }
    let tcNum;
    try {
      tcNum = form.tc ? parseOptionalNumberInput(form.tc, 0) : null;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    if (kind === "dividendo") {
      if (!form.monto) {
        toast.error("Completá el monto");
        return;
      }
      let monto;
      try {
        monto = parsePositiveNumberInput(form.monto, "Monto");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Revisa el monto");
        return;
      }
      const {
        error
      } = await supabase.from("inversiones_dividendos").insert({
        user_id: userId,
        activo_id: form.activo_id,
        fecha: form.fecha,
        monto_usd: monto,
        tc: tcNum
      });
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      if (!form.cantidad || !form.precio) {
        toast.error("Completá cantidad y precio");
        return;
      }
      let cant;
      let precio;
      try {
        cant = parsePositiveNumberInput(form.cantidad, "Cantidad");
        precio = parsePositiveNumberInput(form.precio, "Precio");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Revisa los numeros");
        return;
      }
      if (kind === "venta" && qDisponible != null && cant > qDisponible + 1e-6) {
        toast.error(`No podés vender más de ${qDisponible}`);
        return;
      }
      const table = kind === "compra" ? "inversiones_compras" : "inversiones_ventas";
      const payload = {
        user_id: userId,
        activo_id: form.activo_id,
        fecha: form.fecha,
        cantidad: cant,
        precio_usd: precio,
        tc: tcNum
      };
      if (kind === "compra") payload.broker = form.broker || null;
      const {
        error
      } = await supabase.from(table).insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success("Guardado");
    setForm({
      activo_id: "",
      fecha: today,
      cantidad: "",
      precio: "",
      monto: "",
      tc: tc ? String(Math.round(tc)) : "",
      broker: ""
    });
    setOpen(false);
    onCreated();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
      kind === "compra" ? "Nueva compra" : kind === "venta" ? "Nueva venta" : "Nuevo dividendo"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: titles[kind] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Activo *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.activo_id, onValueChange: (v) => setForm({
            ...form,
            activo_id: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: opts.length ? "Elegí" : "Creá un activo primero" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: opts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: a.id, children: [
              a.nombre,
              a.ticker ? ` (${a.ticker})` : ""
            ] }, a.id)) })
          ] }),
          qDisponible != null && selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Disponible: ",
            qDisponible
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fecha, onChange: (e) => setForm({
              ...form,
              fecha: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TC ARS/USD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.tc, onChange: (e) => setForm({
              ...form,
              tc: e.target.value
            }), placeholder: "MEP del día" })
          ] })
        ] }),
        kind === "dividendo" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto USD *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.monto, onChange: (e) => setForm({
            ...form,
            monto: e.target.value
          }), placeholder: "Ej: 25,50" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cantidad *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.cantidad, onChange: (e) => setForm({
              ...form,
              cantidad: e.target.value
            }), placeholder: "Ej: 2,5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Precio USD *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.precio, onChange: (e) => setForm({
              ...form,
              precio: e.target.value
            }), placeholder: "Ej: 180,25" })
          ] })
        ] }),
        kind === "compra" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Broker" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.broker, onChange: (e) => setForm({
            ...form,
            broker: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Guardar" }) })
    ] })
  ] });
}
export {
  Inversiones as component
};
