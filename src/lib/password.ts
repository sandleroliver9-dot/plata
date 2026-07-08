export const PASSWORD_RULES = [
  { label: "8 o más caracteres", test: (v: string) => v.length >= 8, issue: "La contraseña necesita al menos 8 caracteres." },
  { label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v), issue: "Agregá al menos una mayúscula." },
  { label: "Un número", test: (v: string) => /[0-9]/.test(v), issue: "Agregá al menos un número." },
  { label: "Un símbolo (ej: !)", test: (v: string) => /[^A-Za-z0-9]/.test(v), issue: "Agregá al menos un símbolo, por ejemplo !" },
] as const;

export function passwordIssue(value: string): string | null {
  return PASSWORD_RULES.find((rule) => !rule.test(value))?.issue ?? null;
}
