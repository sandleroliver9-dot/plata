import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string };

export function SubTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex gap-1 p-1 bg-muted/30 rounded-lg overflow-x-auto -mx-1">
      {tabs.map((t) => {
        const active = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to as any}
            className={cn(
              "px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
              active ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export const FLUJO_TABS: Tab[] = [
  { to: "/movimientos", label: "Movimientos" },
  { to: "/ingresos", label: "Ingresos" },
  { to: "/gastos-fijos", label: "Gastos fijos" },
];


export const CREDITO_TABS: Tab[] = [
  { to: "/tarjetas", label: "Tarjetas y cuotas" },
  { to: "/prestamo", label: "Préstamos" },
];
