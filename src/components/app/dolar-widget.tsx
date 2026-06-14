import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DollarSign, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDolares } from "@/lib/quotes.functions";

function formatARS(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export function DolarWidget() {
  const fetchFn = useServerFn(getDolares);
  const { data, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = [
    { label: "Oficial", value: data?.oficial },
    { label: "Blue", value: data?.blue, accent: true },
    { label: "MEP", value: data?.mep },
    { label: "CCL", value: data?.ccl },
    { label: "Cripto", value: data?.cripto },
    { label: "Tarjeta", value: data?.tarjeta },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-success" />
          <h3 className="font-semibold">Cotización del dólar</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label} className={`p-3 rounded-lg border ${it.accent ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{it.label}</div>
            <div className="num text-lg font-bold mt-1">{formatARS(it.value)}</div>
          </div>
        ))}
      </div>
      {dataUpdatedAt > 0 && (
        <p className="text-xs text-muted-foreground mt-3">Actualizado: {new Date(dataUpdatedAt).toLocaleTimeString("es-AR")}</p>
      )}
    </Card>
  );
}
