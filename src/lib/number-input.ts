export function parseNumberInput(value: unknown): number {
  const raw = String(value ?? "").trim();
  if (!raw) return Number.NaN;

  let cleaned = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!cleaned || cleaned === "-" || cleaned === "," || cleaned === ".") return Number.NaN;

  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = cleaned
      .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
      .replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot >= 0) {
    const parts = cleaned.split(".");
    // "0.005" nunca es una separacion de miles (nadie escribe "0,005" para
    // decir "5"): tratarlo como tal convertia cantidades fraccionarias de
    // cripto en compras 1000 veces mas grandes que las reales.
    const looksLikeThousands = parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1 && parts[0].length <= 3 && parts[0] !== "0";
    if (parts.length > 2 || looksLikeThousands) {
      normalized = cleaned.replace(/\./g, "");
    }
  }

  const parsed = Number(`${negative ? "-" : ""}${normalized}`);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parsePositiveNumberInput(value: unknown, label = "Monto"): number {
  const parsed = parseNumberInput(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} invalido`);
  }
  return parsed;
}

export function parseOptionalNumberInput(value: unknown, fallback = 0, label = "Valor"): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const parsed = parseNumberInput(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}

export function parseIntegerInput(value: unknown, label = "Valor", fallback?: number): number {
  const raw = String(value ?? "").trim();
  if (!raw && fallback !== undefined) return fallback;
  const parsed = parseNumberInput(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}
