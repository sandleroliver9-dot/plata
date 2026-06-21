import { c as createServerRpc } from "./createServerRpc-DJgxn4SY.mjs";
import { a as createServerFn } from "./server-BjmrHUg4.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const getDolares_createServerFn_handler = createServerRpc({
  id: "eaf8331df52ae575fb4470a7caf5df65793363269e37688d3a44ee5ea30aa27e",
  name: "getDolares",
  filename: "src/lib/quotes.functions.ts"
}, (opts) => getDolares.__executeServer(opts));
const getDolares = createServerFn({
  method: "GET"
}).handler(getDolares_createServerFn_handler, async () => {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(`dolarapi ${res.status}`);
    const arr = await res.json();
    const pick = (k) => arr.find((x) => x.casa === k)?.venta;
    return {
      oficial: pick("oficial"),
      blue: pick("blue"),
      mep: pick("bolsa"),
      ccl: pick("contadoconliqui"),
      cripto: pick("cripto"),
      tarjeta: pick("tarjeta"),
      fetched_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return {
      fetched_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
const CG_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  MATIC: "matic-network",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  LTC: "litecoin",
  TRX: "tron",
  SHIB: "shiba-inu",
  ATOM: "cosmos",
  UNI: "uniswap",
  NEAR: "near"
};
const STABLES = {
  USDT: 1,
  USDC: 1,
  DAI: 1
};
const COINBASE_SYMBOLS = {
  MATIC: "POL"
};
async function getCoinbaseSpot(sym) {
  const base = COINBASE_SYMBOLS[sym] ?? sym;
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${encodeURIComponent(base)}-USD/spot`, {
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) return void 0;
    const json = await res.json();
    const price = Number(json.data?.amount);
    return Number.isFinite(price) && price > 0 ? price : void 0;
  } catch {
    return void 0;
  }
}
const getCryptoQuotes_createServerFn_handler = createServerRpc({
  id: "694561fb274a914bc76bc6cb408218244b5b46fcbd24f148794d9a528f983d52",
  name: "getCryptoQuotes",
  filename: "src/lib/quotes.functions.ts"
}, (opts) => getCryptoQuotes.__executeServer(opts));
const getCryptoQuotes = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(getCryptoQuotes_createServerFn_handler, async ({
  data
}) => {
  const req = [...new Set(data.tickers.map((t) => t.toUpperCase()))];
  const out = [];
  let arsRate;
  try {
    const dr = await fetch("https://dolarapi.com/v1/dolares/cripto", {
      headers: {
        Accept: "application/json"
      }
    });
    if (dr.ok) {
      const j = await dr.json();
      if (typeof j.venta === "number") arsRate = j.venta;
    }
  } catch {
  }
  for (const sym of req) {
    if (STABLES[sym] != null) {
      const usd = STABLES[sym];
      out.push({
        id: sym.toLowerCase(),
        symbol: sym,
        usd,
        ars: arsRate ? usd * arsRate : void 0,
        change24h: 0
      });
    }
  }
  const cgSyms = req.filter((s) => CG_IDS[s]);
  if (cgSyms.length > 0) {
    const ids = cgSyms.map((s) => CG_IDS[s]).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      });
      if (res.ok) {
        const json = await res.json();
        for (const sym of cgSyms) {
          const id = CG_IDS[sym];
          const row = json[id];
          if (!row || typeof row.usd !== "number") continue;
          out.push({
            id,
            symbol: sym,
            usd: row.usd,
            ars: arsRate ? row.usd * arsRate : void 0,
            change24h: typeof row.usd_24h_change === "number" ? row.usd_24h_change : void 0
          });
        }
      }
    } catch {
    }
  }
  const found = new Set(out.map((q) => q.symbol));
  const missing = req.filter((sym) => !found.has(sym));
  if (missing.length > 0) {
    await Promise.all(missing.map(async (sym) => {
      const usd = await getCoinbaseSpot(sym);
      if (!usd) return;
      out.push({
        id: sym.toLowerCase(),
        symbol: sym,
        usd,
        ars: arsRate ? usd * arsRate : void 0
      });
    }));
  }
  return req.map((sym) => out.find((q) => q.symbol === sym)).filter((q) => Boolean(q));
});
const getStockQuotes_createServerFn_handler = createServerRpc({
  id: "594479d7a2aa23e01c3a5c58ea29a01f9f1b267cb87c24a8a01d86ea4cd716ee",
  name: "getStockQuotes",
  filename: "src/lib/quotes.functions.ts"
}, (opts) => getStockQuotes.__executeServer(opts));
const getStockQuotes = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(getStockQuotes_createServerFn_handler, async ({
  data
}) => {
  const unique = [...new Set(data.tickers.map((t) => t.toUpperCase().trim()).filter(Boolean))];
  if (unique.length === 0) return [];
  const out = [];
  await Promise.all(unique.map(async (sym) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      });
      if (!res.ok) return;
      const json = await res.json();
      const r = json?.chart?.result?.[0];
      const price = r?.meta?.regularMarketPrice;
      const prev = r?.meta?.chartPreviousClose;
      const currency = r?.meta?.currency;
      if (typeof price === "number") {
        out.push({
          symbol: sym,
          usd: price,
          change: prev ? (price - prev) / prev * 100 : void 0,
          currency
        });
      }
    } catch {
    }
  }));
  return out;
});
const getInflacion_createServerFn_handler = createServerRpc({
  id: "15ef5c823b2f47a284b37f8f3c14c8b61c48248244ca2dc916327fb586ef332d",
  name: "getInflacion",
  filename: "src/lib/quotes.functions.ts"
}, (opts) => getInflacion.__executeServer(opts));
const getInflacion = createServerFn({
  method: "GET"
}).handler(getInflacion_createServerFn_handler, async () => {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion", {
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(`argentinadatos ${res.status}`);
    const arr = await res.json();
    const sorted = arr.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
    const last = sorted[sorted.length - 1];
    const tail = (n) => sorted.slice(-n);
    const avg = (xs) => xs.length ? xs.reduce((s, x) => s + Number(x.valor), 0) / xs.length : 0;
    return {
      ultimoMes: last,
      promedio3m: avg(tail(3)),
      promedio6m: avg(tail(6)),
      serie: sorted.slice(-12),
      fetched_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return {
      serie: [],
      fetched_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
export {
  getCryptoQuotes_createServerFn_handler,
  getDolares_createServerFn_handler,
  getInflacion_createServerFn_handler,
  getStockQuotes_createServerFn_handler
};
