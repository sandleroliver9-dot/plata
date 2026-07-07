export function passwordIssue(value: string): string | null {
  if (value.length < 8) return "La contraseña necesita al menos 8 caracteres.";
  if (!/[A-Z]/.test(value)) return "Agregá al menos una mayúscula.";
  if (!/[0-9]/.test(value)) return "Agregá al menos un número.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Agregá al menos un símbolo, por ejemplo !";
  return null;
}
