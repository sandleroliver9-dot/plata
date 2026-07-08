import { describe, expect, it } from "vitest";
import { estimateNetWorth } from "./financial-centers";

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
