import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sugiere una categoría por fila para movimientos importados por CSV (y en
 * el futuro, para los que lleguen automáticamente vía Belvo) que no
 * trajeron categoría propia. Un solo pedido a la IA para todo el lote, no
 * uno por fila — más rápido y mucho más barato.
 *
 * Igual que parseQuickEntry: solo sugiere, nunca decide por su cuenta y
 * nunca se aplica sin que el usuario pueda verlo/corregirlo en la pantalla
 * de importación antes de confirmar. Gateado detrás de ANTHROPIC_API_KEY:
 * sin esa clave, devuelve { configured: false } y la importación sigue
 * funcionando igual que siempre, solo que sin categoría sugerida.
 */
export const suggestCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { filas: { descripcion: string; tipo: string }[]; categorias: string[] }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { configured: false as const };
    }

    const filas = data.filas.slice(0, 500);
    if (filas.length === 0 || data.categorias.length === 0) {
      return { configured: true as const, categorias: filas.map(() => "") };
    }

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const listado = filas.map((f, i) => `${i}. (${f.tipo}) ${f.descripcion}`).join("\n");

    const message = await client.messages.create({
      // Tarea de clasificacion simple: el modelo chico/rapido alcanza y sale
      // mucho mas barato que uno grande para un lote de hasta 500 filas.
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      tools: [
        {
          name: "categorizar_movimientos",
          description: "Asigna una categoría a cada movimiento de la lista, por índice.",
          input_schema: {
            type: "object",
            properties: {
              resultados: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    indice: { type: "number" },
                    categoria: {
                      type: "string",
                      description: `Una de estas: ${data.categorias.join(", ")}. Si ninguna aplica bien, dejar vacío.`,
                    },
                  },
                  required: ["indice", "categoria"],
                },
              },
            },
            required: ["resultados"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "categorizar_movimientos" },
      messages: [
        {
          role: "user",
          content: `Categorizá cada uno de estos movimientos financieros (uno por línea, con su índice):\n${listado}`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { configured: true as const, categorias: filas.map(() => "") };
    }

    const parsed = toolUse.input as { resultados?: { indice: number; categoria: string }[] };
    const porIndice = new Map((parsed.resultados ?? []).map((r) => [r.indice, r.categoria]));
    return {
      configured: true as const,
      categorias: filas.map((_, i) => porIndice.get(i) ?? ""),
    };
  });
