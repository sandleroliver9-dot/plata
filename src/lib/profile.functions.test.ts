import { describe, expect, it } from "vitest";
import { financialMonth } from "./finance";
import { resolveEffectivePayDay, resolveSalaryPayDate } from "./profile.functions";

describe("resolveSalaryPayDate", () => {
  it("keeps the salary in the current financial month when today is before pay day this calendar month", () => {
    const today = new Date(2026, 6, 2); // July 2, pay day is the 5th: still in June's financial period.
    const payDate = resolveSalaryPayDate(5, "fixed_day", today);
    expect(financialMonth(payDate, 5)).toBe(financialMonth(today, 5));
  });

  it("keeps the salary in the current financial month when today is on/after pay day this calendar month", () => {
    const today = new Date(2026, 6, 28); // July 28: already in July's financial period.
    const payDate = resolveSalaryPayDate(5, "fixed_day", today);
    expect(financialMonth(payDate, 5)).toBe(financialMonth(today, 5));
  });
});

describe("resolveEffectivePayDay", () => {
  it("ignores a stale raw pay day (e.g. left over from switching modes) for last_business_day", () => {
    const today = new Date(2026, 6, 10); // July 10
    // 31 is a leftover value from a previous "día fijo" configuration; it should
    // never be persisted back or used to compute the current month once the
    // user is on "último día hábil del mes".
    const { payDay, payDate } = resolveEffectivePayDay(31, "last_business_day", today);
    expect(payDay).toBe(payDate.getDate());
    expect(payDay).not.toBe(31);
    // El día de cobro (~fin de junio) todavía no llegó para el período que
    // arranca en julio, así que el 10 de julio sigue perteneciendo al período
    // financiero que arrancó a fin de junio.
    expect(financialMonth(today, payDay)).toBe(financialMonth(payDate, payDay));
  });

  it("keeps the raw pay day untouched for fixed_day mode", () => {
    const { payDay } = resolveEffectivePayDay(15, "fixed_day", new Date(2026, 6, 10));
    expect(payDay).toBe(15);
  });
});
