import { createServerFn } from "@tanstack/react-start";

export type Dolares = {
  oficial?: number;
  blue?: number;
  mep?: number;
  ccl?: number;
  cripto?: number;
  tarjeta?: number;
  fetched_at: string;
};

export const getDolares = createServerFn({ method: "GET" }).handler(async (): Promise<Dolares> => {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`dolarapi ${res.status}`);
    const arr = (await res.json()) as Array<{ casa: string; venta: number }>;
    const pick = (k: string) => arr.find((x) => x.casa === k)?.venta;
    return {
      oficial: pick("oficial"),
      blue: pick("blue"),
      mep: pick("bolsa"),
      ccl: pick("contadoconliqui"),
      cripto: pick("cripto"),
      tarjeta: pick("tarjeta"),
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return { fetched_at: new Date().toISOString() };
  }
});

export type CryptoQuote = { id: string; symbol: string; usd: number; ars?: number; change24h?: number };

// Symbol -> CoinGecko id
const CG_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana", XRP: "ripple",
  ADA: "cardano", DOGE: "dogecoin", MATIC: "matic-network", DOT: "polkadot", AVAX: "avalanche-2",
  LINK: "chainlink", LTC: "litecoin", TRX: "tron", SHIB: "shiba-inu", ATOM: "cosmos",
  UNI: "uniswap", NEAR: "near",
};
const STABLES: Record<string, number> = { USDT: 1, USDC: 1, DAI: 1 };
const COINBASE_SYMBOLS: Record<string, string> = { MATIC: "POL" };

async function getCoinbaseSpot(sym: string): Promise<number | undefined> {
  const base = COINBASE_SYMBOLS[sym] ?? sym;
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${encodeURIComponent(base)}-USD/spot`, { headers: { Accept: "application/json" } });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: { amount?: string } };
    const price = Number(json.data?.amount);
    return Number.isFinite(price) && price > 0 ? price : undefined;
  } catch {
    return undefined;
  }
}

export const getCryptoQuotes = createServerFn({ method: "POST" })
  .inputValidator((d: { tickers: string[] }) => d)
  .handler(async ({ data }): Promise<CryptoQuote[]> => {
    const req = [...new Set(data.tickers.map((t) => t.toUpperCase()))];
    const out: CryptoQuote[] = [];

    // ARS rate from dolar cripto, to convert USD -> ARS
    let arsRate: number | undefined;
    try {
      const dr = await fetch("https://dolarapi.com/v1/dolares/cripto", { headers: { Accept: "application/json" } });
      if (dr.ok) {
        const j = (await dr.json()) as { venta?: number };
        if (typeof j.venta === "number") arsRate = j.venta;
      }
    } catch { /* ignore */ }

    for (const sym of req) {
      if (STABLES[sym] != null) {
        const usd = STABLES[sym];
        out.push({ id: sym.toLowerCase(), symbol: sym, usd, ars: arsRate ? usd * arsRate : undefined, change24h: 0 });
      }
    }

    const cgSyms = req.filter((s) => CG_IDS[s]);
    if (cgSyms.length > 0) {
      const ids = cgSyms.map((s) => CG_IDS[s]).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (res.ok) {
          const json = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
          for (const sym of cgSyms) {
            const id = CG_IDS[sym];
            const row = json[id];
            if (!row || typeof row.usd !== "number") continue;
            out.push({
              id,
              symbol: sym,
              usd: row.usd,
              ars: arsRate ? row.usd * arsRate : undefined,
              change24h: typeof row.usd_24h_change === "number" ? row.usd_24h_change : undefined,
            });
          }
        }
      } catch { /* ignore */ }
    }

    const found = new Set(out.map((q) => q.symbol));
    const missing = req.filter((sym) => !found.has(sym));
    if (missing.length > 0) {
      await Promise.all(missing.map(async (sym) => {
        const usd = await getCoinbaseSpot(sym);
        if (!usd) return;
        out.push({ id: sym.toLowerCase(), symbol: sym, usd, ars: arsRate ? usd * arsRate : undefined });
      }));
    }

    return req.map((sym) => out.find((q) => q.symbol === sym)).filter((q): q is CryptoQuote => Boolean(q));
  });


export type StockQuote = { symbol: string; usd: number; change?: number; currency?: string };

export const getStockQuotes = createServerFn({ method: "POST" })
  .inputValidator((d: { tickers: string[] }) => d)
  .handler(async ({ data }): Promise<StockQuote[]> => {
    const unique = [...new Set(data.tickers.map((t) => t.toUpperCase().trim()).filter(Boolean))];
    if (unique.length === 0) return [];
    const out: StockQuote[] = [];
    await Promise.all(unique.map(async (sym) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
        const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) return;
        const json = await res.json() as any;
        const r = json?.chart?.result?.[0];
        const price = r?.meta?.regularMarketPrice;
        const prev = r?.meta?.chartPreviousClose;
        const currency = r?.meta?.currency;
        if (typeof price === "number") {
          out.push({ symbol: sym, usd: price, change: prev ? ((price - prev) / prev) * 100 : undefined, currency });
        }
      } catch { /* ignore */ }
    }));
    return out;
  });

export type Inflacion = {
  ultimoMes?: { fecha: string; valor: number };
  promedio3m?: number;
  promedio6m?: number;
  serie: Array<{ fecha: string; valor: number }>;
  fetched_at: string;
};

export const getInflacion = createServerFn({ method: "GET" }).handler(async (): Promise<Inflacion> => {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`argentinadatos ${res.status}`);
    const arr = (await res.json()) as Array<{ fecha: string; valor: number }>;
    const sorted = arr.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
    const last = sorted[sorted.length - 1];
    const tail = (n: number) => sorted.slice(-n);
    const avg = (xs: typeof sorted) => xs.length ? xs.reduce((s, x) => s + Number(x.valor), 0) / xs.length : 0;
    return {
      ultimoMes: last,
      promedio3m: avg(tail(3)),
      promedio6m: avg(tail(6)),
      serie: sorted.slice(-12),
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return { serie: [], fetched_at: new Date().toISOString() };
  }
});
