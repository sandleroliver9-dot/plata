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
  monthsBetween,
  nextFinancialMonth,
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

  it("stays in the same financial month on and after pay day, when pay day is early (<16)", () => {
    expect(financialMonth(new Date(2026, 5, 10), 10)).toBe("jun 2026");
    expect(financialMonth(new Date(2026, 5, 30), 10)).toBe("jun 2026");
  });

  it("rolls back to the previous financial month before pay day, when pay day is early (<16)", () => {
    // Paid on the 10th: June 5 still belongs to May's financial period.
    expect(financialMonth(new Date(2026, 5, 5), 10)).toBe("may 2026");
  });

  it("rolls over the year boundary correctly", () => {
    // Paid on the 15th: Jan 10, 2026 belongs to December 2025's period.
    expect(financialMonth(new Date(2026, 0, 10), 15)).toBe("dic 2025");
  });

  it("names the period after the month where most of its days fall, not the month it starts in, when pay day is late (>=16) (regression)", () => {
    // Reportado en vivo por un usuario real con dia de pago 30: el periodo
    // que arranca el 30/6 y termina el 29/7 tiene 1 solo dia en junio y 29
    // en julio. Antes de este fix se etiquetaba "jun 2026" (el mes en que
    // arranca), lo cual el usuario correctamente identifico como un error:
    // "cobro el 30 de junio y con eso vivo en JULIO". Ahora se etiqueta por
    // donde vive la mayoria de sus dias.
    expect(financialMonth(new Date(2026, 5, 30), 30)).toBe("jul 2026");
    expect(financialMonth(new Date(2026, 6, 10), 30)).toBe("jul 2026");
    expect(financialMonth(new Date(2026, 6, 29), 30)).toBe("jul 2026");
    // El dia anterior al cobro (29/6) todavia pertenece al periodo previo
    // (30/5 al 29/6, casi entero en junio) -> "jun 2026".
    expect(financialMonth(new Date(2026, 5, 29), 30)).toBe("jun 2026");
  });

  it("treats pay day 31 as the last day of shorter months instead of losing the whole month", () => {
    // 2026 is not a leap year: February has 28 days. Pay day 31 is >=16, so
    // every period is named after the month it rolls into (see test above).
    expect(financialMonth(new Date(2026, 1, 1), 31)).toBe("feb 2026");
    expect(financialMonth(new Date(2026, 1, 27), 31)).toBe("feb 2026");
    expect(financialMonth(new Date(2026, 1, 28), 31)).toBe("mar 2026");
    // April has 30 days.
    expect(financialMonth(new Date(2026, 3, 29), 31)).toBe("abr 2026");
    expect(financialMonth(new Date(2026, 3, 30), 31)).toBe("may 2026");
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

  it("spans from pay day to the day before next pay day when pay day > 1 but early (<16)", () => {
    // Paid on the 10th: "jun 2026" runs June 10 -> July 9.
    const range = financialPeriodRange("jun 2026", 10);
    expect(range?.start.getMonth()).toBe(5);
    expect(range?.start.getDate()).toBe(10);
    expect(range?.end.getMonth()).toBe(6);
    expect(range?.end.getDate()).toBe(9);
    expect(formatFinancialPeriodRange("jun 2026", 10)).toBe("10 jun al 9 jul");
  });

  it("starts the period in the PREVIOUS month when pay day is late (>=16) (regression)", () => {
    // Paid on the 30th: "jul 2026" (the financial month the user lives in
    // with that paycheck) actually starts June 30, not July 30. Inverse of
    // the financialMonth() regression above -- has to stay consistent with
    // it, since movimientos.tsx stamps mes_financiero using financialMonth()
    // but shows the human-readable range using this function.
    const range = financialPeriodRange("jul 2026", 30);
    expect(range?.start.getMonth()).toBe(5);
    expect(range?.start.getDate()).toBe(30);
    expect(range?.end.getMonth()).toBe(6);
    expect(range?.end.getDate()).toBe(29);
    expect(formatFinancialPeriodRange("jul 2026", 30)).toBe("30 jun al 29 jul");
  });

  it("returns null for an invalid label", () => {
    expect(financialPeriodRange("no-es-un-mes", 25)).toBeNull();
    expect(formatFinancialPeriodRange("no-es-un-mes", 25)).toBeNull();
  });

  it("stays consistent with financialMonth() for every day in a period, across a range of pay days (regression)", () => {
    // Red de seguridad general: cualquier fecha dentro del rango que
    // financialPeriodRange() calcula para un label tiene que volver a
    // etiquetarse con ESE MISMO label al pasarla por financialMonth(). Si
    // alguna vez se desalinean (como paso con el fix de dia de pago tardio),
    // pantallas que arman el rango a mostrar (ej: "30 jun al 29 jul") y
    // pantallas que filtran movimientos por mes_financiero dejarian de
    // coincidir.
    for (const payDay of [1, 5, 10, 15, 16, 20, 25, 29, 30, 31]) {
      for (const label of ["ene 2026", "jun 2026", "dic 2026"]) {
        const range = financialPeriodRange(label, payDay)!;
        expect(financialMonth(range.start, payDay)).toBe(label);
        expect(financialMonth(range.end, payDay)).toBe(label);
      }
    }
  });
});

describe("nextFinancialMonth", () => {
  it("advances one calendar month when pay day is the 1st", () => {
    expect(nextFinancialMonth("jun 2026", 1)).toBe("jul 2026");
  });

  it("rolls over the year boundary", () => {
    expect(nextFinancialMonth("dic 2026", 1)).toBe("ene 2027");
  });

  it("returns the label unchanged for an invalid input", () => {
    expect(nextFinancialMonth("no-es-un-mes", 10)).toBe("no-es-un-mes");
  });

  it("stays exactly one financial month ahead across a range of pay days, including late ones (regression)", () => {
    // Con dia de pago tardio (>=16) el label no avanza 1:1 con el mes
    // calendario de arranque del periodo (ver financialMonth) — este test
    // corrobora que nextFinancialMonth() sigue dando el periodo siguiente
    // real (via financialPeriodRange), no un +1 mes ingenuo sobre el label.
    for (const payDay of [1, 5, 10, 15, 16, 20, 25, 29, 30, 31]) {
      for (const label of ["ene 2026", "jun 2026", "dic 2026"]) {
        const next = nextFinancialMonth(label, payDay);
        const a = parseFinancialMonth(label)!;
        const b = parseFinancialMonth(next)!;
        expect(monthsBetween(a, b)).toBe(1);
        // Y el dia siguiente al fin del periodo actual cae justo dentro del
        // periodo "siguiente" recien calculado.
        const range = financialPeriodRange(label, payDay)!;
        const dayAfter = new Date(range.end);
        dayAfter.setDate(dayAfter.getDate() + 1);
        expect(financialMonth(dayAfter, payDay)).toBe(next);
      }
    }
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
