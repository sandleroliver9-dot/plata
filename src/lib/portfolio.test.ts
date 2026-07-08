import { describe, expect, it } from "vitest";
import { computeBalance, type Activo, type Compra } from "./portfolio";

function activo(overrides: Partial<Activo> = {}): Activo {
  return {
    id: "a1",
    ticker: "TEST",
    nombre: "Test Asset",
    tipo: "Acción",
    sector: null,
    moneda_base: "USD",
    valor_actual_usd: 150,
    precio_actualizado_en: null,
    activo: true,
    ...overrides,
  };
}

function compra(overrides: Partial<Compra> = {}): Compra {
  return {
    id: "c1",
    activo_id: "a1",
    fecha: "2026-01-01",
    cantidad: 10,
    precio_usd: 100,
    tc: null,
    broker: null,
    ...overrides,
  };
}

describe("computeBalance", () => {
  it("values a simple position in both USD and ARS using the given exchange rate", () => {
    const { rows } = computeBalance([activo()], [compra()], [], [], 1000);
    expect(rows).toHaveLength(1);
    const [row] = rows;
    expect(row.cantidad).toBe(10);
    expect(row.pMedioUSD).toBe(100);
    expect(row.valorUSD).toBe(1500); // 10 units * $150 current price
    expect(row.valorARS).toBe(1_500_000); // valorUSD * tc
  });

  it("excludes fully-sold assets from the resulting rows' quantity", () => {
    const { rows } = computeBalance(
      [activo()],
      [compra()],
      [{ id: "v1", activo_id: "a1", fecha: "2026-02-01", cantidad: 10, precio_usd: 120, tc: null }],
      [],
      1000,
    );
    expect(rows[0].cantidad).toBe(0);
  });

  it("reports a warning instead of silently dropping a sale with no backing holdings", () => {
    // No hay compras: la venta no tiene nada que respaldarla (ej: se borró
    // la compra original).
    const { rows, warnings } = computeBalance(
      [activo()],
      [],
      [{ id: "v1", activo_id: "a1", fecha: "2026-02-01", cantidad: 5, precio_usd: 120, tc: null }],
      [],
      1000,
    );
    expect(rows[0].cantidad).toBe(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ activoId: "a1", ventaId: "v1" });
  });

  it("combines a partial sale's realized gain with dividends, keeping the remaining position at cost (regression)", () => {
    // Reproduce el flujo probado a mano en Inversiones: compra 10 @150,
    // vende 4 @180 (gana (180-150)*4=120), cobra un dividendo de 12,5.
    // "G/P realizada + Divs" en la UI es exactamente realizadaUSD + divUSDTotal.
    const { rows } = computeBalance(
      [activo({ valor_actual_usd: 150 })],
      [compra({ cantidad: 10, precio_usd: 150 })],
      [{ id: "v1", activo_id: "a1", fecha: "2026-02-01", cantidad: 4, precio_usd: 180, tc: null }],
      [{ id: "d1", activo_id: "a1", fecha: "2026-02-05", monto_usd: 12.5, tc: null }],
      1000,
    );
    const [row] = rows;
    expect(row.cantidad).toBe(6);
    expect(row.pMedioUSD).toBe(150);
    expect(row.valorUSD).toBe(900); // 6 restantes * $150 (precio actual = precio de compra en este caso)
    expect(row.realizadaUSD).toBe(120);
    expect(row.divUSDTotal).toBe(12.5);
    expect(row.realizadaUSD + row.divUSDTotal).toBe(132.5);
  });
});
