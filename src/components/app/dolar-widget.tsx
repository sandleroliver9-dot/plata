import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
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
    <div className="bg-white border border-[#d9d9d9] rounded-[11px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] tracking-wider text-[#8e8e88] uppercase font-plus-jakarta">Dólar hoy</h3>
        <button onClick={() => refetch()} disabled={isFetching} aria-label="Actualizar cotizaciones">
          <RefreshCw className={`size-4 text-[#8e8e88] ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label} className={`p-2.5 rounded-[11px] border ${it.accent ? "border-[#20376b] bg-[#eaf2fa]" : "border-[#d9d9d9]"}`}>
            <div className="text-[10px] text-[#8e8e88] uppercase tracking-wider font-plus-jakarta">{it.label}</div>
            <div className="num text-base font-bold mt-1 text-[#20376b] font-plus-jakarta">{formatARS(it.value)}</div>
          </div>
        ))}
      </div>
      {dataUpdatedAt > 0 && (
        <p className="text-[11px] text-[#8e8e88] font-plus-jakarta mt-3">Actualizado: {new Date(dataUpdatedAt).toLocaleTimeString("es-AR")}</p>
      )}
    </div>
  );
}
