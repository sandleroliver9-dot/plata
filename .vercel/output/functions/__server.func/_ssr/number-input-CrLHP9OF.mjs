import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
function DecimalInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...props, type: "text", inputMode: "decimal", autoComplete: props.autoComplete ?? "off" });
}
function IntegerInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...props, type: "text", inputMode: "numeric", pattern: "[0-9]*", autoComplete: props.autoComplete ?? "off" });
}
function parseNumberInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return Number.NaN;
  let cleaned = raw.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "," || cleaned === ".") return Number.NaN;
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = cleaned.replace(new RegExp(`\\${thousandSeparator}`, "g"), "").replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot >= 0) {
    const parts = cleaned.split(".");
    if (parts.length > 2 || parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      normalized = cleaned.replace(/\./g, "");
    }
  }
  const parsed = Number(`${negative ? "-" : ""}${normalized}`);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
function parsePositiveNumberInput(value, label = "Monto") {
  const parsed = parseNumberInput(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} invalido`);
  }
  return parsed;
}
function parseOptionalNumberInput(value, fallback = 0, label = "Valor") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const parsed = parseNumberInput(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}
function parseIntegerInput(value, label = "Valor", fallback) {
  const raw = String(value ?? "").trim();
  if (!raw && fallback !== void 0) return fallback;
  const parsed = parseNumberInput(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) throw new Error(`${label} invalido`);
  return parsed;
}
export {
  DecimalInput as D,
  IntegerInput as I,
  parseOptionalNumberInput as a,
  parsePositiveNumberInput as b,
  parseNumberInput as c,
  parseIntegerInput as p
};
