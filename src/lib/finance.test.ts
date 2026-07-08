import { describe, expect, it } from "vitest";
import {
  appNow,
  currentCalendarMonthLabel,
  currentFinancialMonth,
  financialMonth,
  financialPeriodRange,
  formatFinancialPeriodRange,
  installmentForFinancialMonth,
  listFinancialMonths,
  parseFinancialMonth,
} from "./finance";

describe("appNow", () => {
  it("reflects Argentina wall-clock time regardless of the runtime's own timezone", () => {
    // Este test corre en CI/produccion con TZ=UTC: si appNow() se rompiera y
    // volviera a usar `new Date()` directo, este assert lo detectaria
    // comparando contra Intl formateado a mano en el huso horario correcto
    // (sin asumir un offset fijo, que puede cambiar por horario de verano
    // historico o cambios de politica).
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const now = appNow();
    expect(now.getFullYear()).toBe(get("year"));
    expect(now.getMonth() + 1).toBe(get("month"));
    expect(now.getDate()).toBe(get("day"));
    expect(now.getHours()).toBe(get("hour"));
  });
});

describe("financialMonth", () => {
  it("matches the calendar month when pay day is the 1st", () => {
    expect(financialMonth(new Date(2026, 5, 1), 1)).toBe("jun 2026");
    expect(financialMonth(new Date(2026, 5, 30), 1)).toBe("jun 2026");
  });

  it("stays in the same financial month on and after pay day", () => {
    expect(financialMonth(new Date(2026, 5, 25), 25)).toBe("jun 2026");
    expect(financialMonth(new Date(2026, 5, 30), 25)).toBe("jun 2026");
  });

  it("rolls back to the previous financial month before pay day", () => {
    // Paid on the 25th: June 20 still belongs to May's financial period.
    expect(financialMonth(new Date(2026, 5, 20), 25)).toBe("may 2026");
  });

  it("rolls over the year boundary correctly", () => {
    // Paid on the 15th: Jan 10, 2026 belongs to December 2025's period.
    expect(financialMonth(new Date(2026, 0, 10), 15)).toBe("dic 2025");
  });

  it("treats pay day 31 as the last day of shorter months instead of losing the whole month", () => {
    // 2026 is not a leap year: February has 28 days.
    expect(financialMonth(new Date(2026, 1, 1), 31)).toBe("ene 2026");
    expect(financialMonth(new Date(2026, 1, 27), 31)).toBe("ene 2026");
    expect(financialMonth(new Date(2026, 1, 28), 31)).toBe("feb 2026");
    // April has 30 days.
    expect(financialMonth(new Date(2026, 3, 29), 31)).toBe("mar 2026");
    expect(financialMonth(new Date(2026, 3, 30), 31)).toBe("abr 2026");
  });
});

describe("currentCalendarMonthLabel", () => {
  it("always matches the real calendar month, regardless of pay day", () => {
    // A diferencia de currentFinancialMonth (que puede quedar "atrasado" un
    // mes calendario hasta el proximo cobro si payDay > dia de hoy), esta
    // funcion siempre devuelve el mes real de hoy: por eso tiene que
    // coincidir con financialMonth(hoy, 1), que nunca hace rollback.
    expect(currentCalendarMonthLabel()).toBe(financialMonth(appNow(), 1));
  });
});

describe("parseFinancialMonth / financialMonth round-trip", () => {
  it("parses a label back into the first day of that month", () => {
    const parsed = parseFinancialMonth("jun 2026");
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(5);
  });

  it("returns null for an invalid label", () => {
    expect(parseFinancialMonth("no-es-un-mes")).toBeNull();
  });
});

describe("listFinancialMonths", () => {
  it("returns the requested number of months ending at the current one", () => {
    const months = listFinancialMonths(1, 3, 0);
    expect(months).toHaveLength(4);
    expect(months[months.length - 1]).toBe(financialMonth(appNow(), 1));
  });

  it("includes the current financial month as the last entry even when pay day isn't the 1st (regression)", () => {
    // Con payDay > 1, reconstruir cada mes como "día 1" y volver a pasarlo por
    // financialMonth() corría todo un mes para atrás, dejando afuera el mes
    // financiero actual (bug real detectado en producción: Dashboard/Ingresos/
    // Movimientos mostraban $0 porque el mes en curso no estaba en la lista).
    for (const payDay of [5, 25, 29, 30]) {
      const months = listFinancialMonths(payDay, 5, 0);
      expect(months).toHaveLength(6);
      expect(months[months.length - 1]).toBe(currentFinancialMonth(payDay));
    }
  });

  it("keeps consecutive months in order without gaps or repeats", () => {
    const payDay = 25;
    const months = listFinancialMonths(payDay, 5, 0);
    const parsed = months.map((m) => parseFinancialMonth(m)!);
    for (let i = 1; i < parsed.length; i++) {
      const monthsApart = (parsed[i].getFullYear() - parsed[i - 1].getFullYear()) * 12
        + (parsed[i].getMonth() - parsed[i - 1].getMonth());
      expect(monthsApart).toBe(1);
    }
  });
});

describe("financialPeriodRange / formatFinancialPeriodRange", () => {
  it("covers the whole calendar month when pay day is the 1st", () => {
    const range = financialPeriodRange("jun 2026", 1);
    expect(range?.start.getDate()).toBe(1);
    expect(range?.start.getMonth()).toBe(5);
    expect(range?.end.getDate()).toBe(30);
    expect(range?.end.getMonth()).toBe(5);
  });

  it("spans from pay day to the day before next pay day when pay day > 1", () => {
    // Paid on the 25th: "jun 2026" runs June 25 -> July 24.
    const range = financialPeriodRange("jun 2026", 25);
    expect(range?.start.getMonth()).toBe(5);
    expect(range?.start.getDate()).toBe(25);
    expect(range?.end.getMonth()).toBe(6);
    expect(range?.end.getDate()).toBe(24);
    expect(formatFinancialPeriodRange("jun 2026", 25)).toBe("25 jun al 24 jul");
  });

  it("returns null for an invalid label", () => {
    expect(financialPeriodRange("no-es-un-mes", 25)).toBeNull();
    expect(formatFinancialPeriodRange("no-es-un-mes", 25)).toBeNull();
  });
});

describe("installmentForFinancialMonth", () => {
  it("advances the installment number as financial months pass", () => {
    const cuota = installmentForFinancialMonth({
      inicio: "2026-01-15",
      cuotaActual: 1,
      cuotasTotales: 12,
      mesFinanciero: "mar 2026",
    });
    expect(cuota).toBe(3);
  });

  it("returns null once the installment count exceeds the total", () => {
    const cuota = installmentForFinancialMonth({
      inicio: "2026-01-15",
      cuotaActual: 1,
      cuotasTotales: 2,
      mesFinanciero: "may 2026",
    });
    expect(cuota).toBeNull();
  });

  it("accounts for payDay when inicio falls before the pay day (regression)", () => {
    // Compra en tarjeta: la primer cuota siempre cae el dia 1 del mes
    // siguiente (ver tarjetas.tsx). Con payDay=10, el 1 de agosto todavia
    // pertenece al mes financiero "jul 2026" (el periodo va del 10 de julio
    // al 9 de agosto), NO a "ago 2026" como daria asumir el mes calendario
    // de `inicio` directamente. Antes de este fix, la cuota 1 se contaba dos
    // veces: una como movimiento real en "jul 2026" y otra como cuota
    // sintetica todavia-no-registrada en "ago 2026".
    const cuota1EnJulio = installmentForFinancialMonth({
      inicio: "2026-08-01",
      cuotaActual: 1,
      cuotasTotales: 12,
      mesFinanciero: "jul 2026",
      payDay: 10,
    });
    expect(cuota1EnJulio).toBe(1);

    const cuota2EnAgosto = installmentForFinancialMonth({
      inicio: "2026-08-01",
      cuotaActual: 1,
      cuotasTotales: 12,
      mesFinanciero: "ago 2026",
      payDay: 10,
    });
    expect(cuota2EnAgosto).toBe(2);
  });
});
