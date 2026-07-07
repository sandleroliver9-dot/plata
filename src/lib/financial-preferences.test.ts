import { describe, expect, it } from "vitest";
import { DEFAULT_FINANCIAL_PREFERENCES, getPayDateForMonth, safeDayInMonth } from "./financial-preferences";

describe("safeDayInMonth", () => {
  it("clamps day 31 to the last real day of a shorter month", () => {
    expect(safeDayInMonth(2026, 1, 31)).toBe(28); // February 2026, not a leap year
    expect(safeDayInMonth(2026, 3, 31)).toBe(30); // April
  });

  it("keeps day 31 for months that actually have 31 days", () => {
    expect(safeDayInMonth(2026, 0, 31)).toBe(31); // January
  });
});

describe("getPayDateForMonth", () => {
  it("clamps a fixed pay day of 31 against February instead of overflowing into March", () => {
    const preferences = {
      ...DEFAULT_FINANCIAL_PREFERENCES,
      income: { ...DEFAULT_FINANCIAL_PREFERENCES.income, payDateMode: "fixed_day" as const, payDay: 31 },
    };
    const date = getPayDateForMonth(2026, 1, preferences); // February
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(28);
  });
});
