import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Activity, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getStockQuotes, getCryptoQuotes } from "@/lib/quotes.functions";

const DEFAULT_STOCKS = ["SPY", "QQQ", "DIA", "^GSPC", "^IXIC", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "KO", "JPM"];
const DEFAULT_CRYPTOS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "LINK", "DOT"];

const LABELS: Record<string, string> = {
  "^GSPC": "S&P 500", "^IXIC": "NASDAQ", "SPY": "S&P 500 ETF", "QQQ": "NASDAQ ETF", "DIA": "Dow Jones ETF",
};

function fmtUSD(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 4 : 2 }).format(n);
}

export function MercadoWidget() {
  const stockFn = useServerFn(getStockQuotes);
  const cryptoFn = useServerFn(getCryptoQuotes);
  const [customStock, setCustomStock] = useState("");
  const [extraStocks, setExtraStocks] = useState<string[]>([]);

  const stockTickers = [...DEFAULT_STOCKS, ...extraStocks];

  const stocks = useQuery({
    queryKey: ["mkt-stocks", stockTickers],
    queryFn: () => stockFn({ data: { tickers: stockTickers } }),
    staleTime: 60 * 1000, refetchInterval: 60 * 1000, refetchOnWindowFocus: false,
  });
  const cryptos = useQuery({
    queryKey: ["mkt-cryptos"],
    queryFn: () => cryptoFn({ data: { tickers: DEFAULT_CRYPTOS } }),
    staleTime: 60 * 1000, refetchInterval: 60 * 1000, refetchOnWindowFocus: false,
  });

  function addStock(e: React.FormEvent) {
    e.preventDefault();
    const t = customStock.trim().toUpperCase();
    if (t && !stockTickers.includes(t)) setExtraStocks((s) => [...s, t]);
    setCustomStock("");
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <h3 className="font-semibold">Mercado en vivo</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { stocks.refetch(); cryptos.refetch(); }} disabled={stocks.isFetching || cryptos.isFetching}>
          <RefreshCw className={`size-4 ${(stocks.isFetching || cryptos.isFetching) ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Tabs defaultValue="acciones">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="acciones">Acciones / ETFs</TabsTrigger>
          <TabsTrigger value="cripto">Cripto</TabsTrigger>
        </TabsList>

        <TabsContent value="acciones" className="mt-3 space-y-3">
          <form onSubmit={addStock} className="flex gap-2">
            <Input value={customStock} onChange={(e) => setCustomStock(e.target.value)} placeholder="Agregar ticker (ej: AMD)" className="h-8" />
            <Button type="submit" size="sm" variant="secondary">Agregar</Button>
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stockTickers.map((t) => {
              const q = stocks.data?.find((x) => x.symbol === t);
              const up = (q?.change ?? 0) >= 0;
              return (
                <div key={t} className="p-3 rounded-lg border border-border bg-card/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold truncate">{LABELS[t] ?? t}</div>
                    {q?.change != null && (
                      up ? <TrendingUp className="size-3 text-success" /> : <TrendingDown className="size-3 text-destructive" />
                    )}
                  </div>
                  <div className="num text-sm font-bold mt-1">{fmtUSD(q?.usd)}</div>
                  {q?.change != null && (
                    <div className={`num text-xs ${up ? "text-success" : "text-destructive"}`}>
                      {up ? "+" : ""}{q.change.toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="cripto" className="mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {DEFAULT_CRYPTOS.map((t) => {
              const q = cryptos.data?.find((x) => x.symbol === t);
              const up = (q?.change24h ?? 0) >= 0;
              return (
                <div key={t} className="p-3 rounded-lg border border-border bg-card/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold">{t}</div>
                    {q?.change24h != null && (
                      up ? <TrendingUp className="size-3 text-success" /> : <TrendingDown className="size-3 text-destructive" />
                    )}
                  </div>
                  <div className="num text-sm font-bold mt-1">{fmtUSD(q?.usd)}</div>
                  {q?.change24h != null && (
                    <div className={`num text-xs ${up ? "text-success" : "text-destructive"}`}>
                      {up ? "+" : ""}{q.change24h.toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground mt-3">
        Actualiza cada 60s. Cripto: CoinGecko · Acciones: Yahoo Finance.
      </p>
    </Card>
  );
}
