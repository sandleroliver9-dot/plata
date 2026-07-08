import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildUpcomingEvents, estimateNetWorth } from "./financial-centers";

describe("estimateNetWorth", () => {
  it("subtracts remaining loan debt from net worth", () => {
    const netWorth = estimateNetWorth({
      inversionesValor: 1000,
      prestamos: [{ cuotas_totales: 12, cuotas_pagadas: 6, cuota_mensual: 100 } as any],
    });
    // 6 cuotas restantes * 100 = 600 de deuda
    expect(netWorth).toBe(1000 - 600);
  });

  it("subtracts remaining card installment debt, including the current one (regression)", () => {
    // Antes de este fix, estimateNetWorth() no restaba deuda de tarjeta:
    // patrimonio.tsx mostraba un patrimonio neto distinto (mas bajo, correcto)
    // que insights.tsx (mas alto, inflado) para el mismo usuario.
    const netWorth = estimateNetWorth({
      inversionesValor: 1000,
      tarjetas: [{ cuotas_totales: 12, cuota_actual: 10, valor_cuota: 50 } as any],
    });
    // Restantes = 12 - 10 + 1 = 3 cuotas * 50 = 150 de deuda
    expect(netWorth).toBe(1000 - 150);
  });

  it("combines investments, real estate, loans and card debt consistently", () => {
    const netWorth = estimateNetWorth({
      inversionesValor: 500,
      inmuebles: [{ valor_estimado: 2000, deuda_asociada: 300 } as any],
      prestamos: [{ cuotas_totales: 10, cuotas_pagadas: 8, cuota_mensual: 100 } as any],
      tarjetas: [{ cuotas_totales: 3, cuota_actual: 3, valor_cuota: 200 } as any],
    });
    // 500 + (2000 - 300) - (2 * 100) - (1 * 200) = 500 + 1700 - 200 - 200 = 1800
    expect(netWorth).toBe(1800);
  });

  it("defaults missing inputs to zero without throwing", () => {
    expect(estimateNetWorth({})).toBe(0);
  });
});

describe("buildUpcomingEvents", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 8, 12, 0, 0)); // 8 jul 2026, mediodia
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dates a loan's next installment from today, not from inicio + cuotas_pagadas (regression)", () => {
    // Un prestamo cargado hoy con cuotas_pagadas > 0 (el usuario venia
    // pagandolo antes de sumarlo a la app) siempre tiene `inicio` = fecha de
    // alta, no la fecha real de la primera cuota. Antes de este fix, la
    // proxima cuota se calculaba como inicio + cuotas_pagadas meses, lo que
    // la mandaba meses al futuro (acá, a octubre) en vez de al proximo
    // vencimiento real (15 de julio). Ese bug hacia que Proyecciones mostrara
    // $0 de gastos para el mes en curso, entre otras roturas en
    // Alertas/Insights/Calendario financiero (que comparten esta funcion).
    const events = buildUpcomingEvents({
      prestamos: [{
        id: "p1",
        descripcion: "Prestamo personal",
        cuota_mensual: 60000,
        cuotas_totales: 24,
        cuotas_pagadas: 3,
        dia_pago: 15,
        inicio: "2026-07-08",
      } as any],
      horizonDays: 60,
    });
    const prestamoEvents = events.filter((e) => e.type === "prestamo");
    expect(prestamoEvents[0]?.date).toBe("2026-07-15");
    expect(prestamoEvents[0]?.detail).toBe("Cuota 4/24");
  });
});
