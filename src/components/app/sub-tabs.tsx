import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string };

export function SubTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex w-full border-b border-[#d9d9d9] font-plus-jakarta">
      {tabs.map((t) => {
        const active = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to as any}
            className={cn(
              "flex-1 px-1 py-3 text-[13px] text-center whitespace-nowrap transition-colors border-b-2 -mb-px",
              active ? "text-[#20376b] border-[#20376b]" : "text-[#70706a] border-transparent hover:text-[#20376b]",
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
