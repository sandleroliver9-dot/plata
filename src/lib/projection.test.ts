import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeProjectionRows } from "./projection";

describe("computeProjectionRows", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 8, 12, 0, 0)); // 8 jul 2026, mediodia
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("converts a salary loaded in a different currency than the user's before projecting (moneda mixta)", () => {
    // Sueldo cobrado en USD, pero el usuario gasta y proyecta en ARS: el
    // primer mes de la proyeccion tiene que reflejar el sueldo ya convertido,
    // no el numero crudo en USD sumado como si fuera ARS.
    const rows = computeProjectionRows({
      data: {
        fijos: [],
        ingresos: [{ tipo: "Sueldo", monto: 1000, moneda: "USD", fecha_cobro: "2026-07-08" }],
        vencimientos: [],
        tarjetas: [],
        prestamos: [],
      },
      profile: { currency: "ARS", pay_day: 1 },
      preferences: undefined,
      salary: 0,
      ahorroPct: 0,
      inflacionPct: 0,
      overdraft: 0,
      currency: "ARS",
      tc: 1200,
    });
    expect(rows[0].sueldo).toBe(1_200_000);
  });

  it("leaves a salary in the same currency untouched (regression, single-currency default)", () => {
    const rows = computeProjectionRows({
      data: {
        fijos: [],
        ingresos: [{ tipo: "Sueldo", monto: 500_000, moneda: null, fecha_cobro: "2026-07-08" }],
        vencimientos: [],
        tarjetas: [],
        prestamos: [],
      },
      profile: { currency: "ARS", pay_day: 1 },
      preferences: undefined,
      salary: 0,
      ahorroPct: 0,
      inflacionPct: 0,
      overdraft: 0,
      currency: "ARS",
    });
    expect(rows[0].sueldo).toBe(500_000);
  });
});
