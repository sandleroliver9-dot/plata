import { describe, expect, it } from "vitest";
import { financialMonth } from "./finance";
import { resolveSalaryPayDate } from "./profile.functions";

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
