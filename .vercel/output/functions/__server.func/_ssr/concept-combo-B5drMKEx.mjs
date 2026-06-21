import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
const CONCEPT_OPTIONS = {
  Ingreso: [
    "Sueldo",
    "Bono",
    "Aguinaldo",
    "Freelance",
    "Honorarios",
    "Venta",
    "Reintegro",
    "Intereses",
    "Dividendos",
    "Alquiler cobrado",
    "Regalo",
    "Otro"
  ],
  Gasto: [
    "Supermercado",
    "Almacén",
    "Verdulería",
    "Carnicería",
    "Comida afuera",
    "Café",
    "Delivery",
    "Nafta",
    "Transporte",
    "Estacionamiento",
    "Peajes",
    "Uber/Taxi",
    "Farmacia",
    "Salud",
    "Prepaga",
    "Gimnasio",
    "Ropa",
    "Hogar",
    "Regalo",
    "Viaje",
    "Ocio",
    "Streaming",
    "Tarjeta de crédito",
    "Préstamo",
    "Cuota",
    "Educación",
    "Otro"
  ],
  GastoFijo: [
    "Alquiler",
    "Expensas",
    "Luz",
    "Gas",
    "Agua",
    "Internet",
    "Celular",
    "Cable",
    "Streaming (Netflix, Spotify...)",
    "Seguro",
    "Prepaga",
    "Gimnasio",
    "Colegio",
    "Cochera",
    "ABL/Impuestos",
    "Otro"
  ]
};
function ConceptCombo({
  kind,
  value,
  onChange,
  placeholder = "Elegí o escribí...",
  maxLength = 100
}) {
  const id = reactExports.useId();
  const options = CONCEPT_OPTIONS[kind];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        list: id,
        value,
        maxLength,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        autoComplete: "off"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id, children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o }, o)) })
  ] });
}
export {
  ConceptCombo as C
};
