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
});
