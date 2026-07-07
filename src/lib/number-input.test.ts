import { describe, expect, it } from "vitest";
import { parseIntegerInput, parseNumberInput, parseOptionalNumberInput, parsePositiveNumberInput } from "./number-input";

describe("parseNumberInput", () => {
  it("parses fractional crypto quantities with a leading zero as decimals, not thousands", () => {
    expect(parseNumberInput("0.005")).toBe(0.005);
    expect(parseNumberInput("0.5")).toBe(0.5);
    expect(parseNumberInput("0.12345678")).toBeCloseTo(0.12345678);
  });

  it("still treats a dot as a thousands separator for whole peso amounts", () => {
    expect(parseNumberInput("1.234")).toBe(1234);
    expect(parseNumberInput("150.000")).toBe(150000);
  });

  it("treats a comma as the decimal separator (es-AR)", () => {
    expect(parseNumberInput("180,25")).toBeCloseTo(180.25);
    expect(parseNumberInput("1.234,56")).toBeCloseTo(1234.56);
  });

  it("handles a plain decimal typed with a dot", () => {
    expect(parseNumberInput("2.5")).toBe(2.5);
  });

  it("returns NaN for empty or invalid input", () => {
    expect(Number.isNaN(parseNumberInput(""))).toBe(true);
    expect(Number.isNaN(parseNumberInput("-"))).toBe(true);
  });
});

describe("parsePositiveNumberInput", () => {
  it("accepts a small fractional crypto quantity", () => {
    expect(parsePositiveNumberInput("0.005", "Cantidad")).toBe(0.005);
  });

  it("throws for zero or negative amounts", () => {
    expect(() => parsePositiveNumberInput("0", "Monto")).toThrow();
    expect(() => parsePositiveNumberInput("-5", "Monto")).toThrow();
  });
});

describe("parseOptionalNumberInput", () => {
  it("returns the fallback for empty input", () => {
    expect(parseOptionalNumberInput("", 42)).toBe(42);
  });
});

describe("parseIntegerInput", () => {
  it("throws for a non-integer value", () => {
    expect(() => parseIntegerInput("1.5")).toThrow();
  });

  it("accepts an integer", () => {
    expect(parseIntegerInput("15")).toBe(15);
  });
});
