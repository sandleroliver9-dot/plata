import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Carga rápida por lenguaje natural: el usuario escribe (o dicta con la voz
 * del teléfono) algo como "gasté 8000 en el super" y esto lo convierte en
 * datos estructurados para precargar el formulario de Movimientos.
 *
 * La IA solo EXTRAE datos de un texto, nunca hace cálculos financieros ni
 * decide nada por su cuenta — y el resultado siempre se muestra en el
 * formulario normal para que el usuario confirme o edite antes de guardar,
 * nunca se guarda directo. Mismo criterio que se definió para el resto de
 * las funciones de IA de la app.
 *
 * Requiere la env var ANTHROPIC_API_KEY (server-only, nunca VITE_). Sin
 * ella, devuelve { configured: false } en vez de romper — la carga manual
 * de siempre sigue funcionando igual.
 */
export const parseQuickEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { texto: string; categorias: string[]; fechaHoy: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { configured: false as const };
    }

    const texto = data.texto.trim().slice(0, 500);
    if (!texto) throw new Error("Escribí algo primero");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      // Tarea simple de extracción: el modelo más chico/rápido alcanza y
      // sale mucho más barato que uno grande, no hace falta razonamiento.
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      tools: [
        {
          name: "registrar_movimiento",
          description: "Extrae los datos de un ingreso o gasto a partir de una frase en lenguaje natural, en pesos argentinos.",
          input_schema: {
            type: "object",
            properties: {
              tipo: { type: "string", enum: ["Ingreso", "Gasto"] },
              monto: { type: "number", description: "Monto en pesos argentinos, siempre positivo, sin signo." },
              descripcion: { type: "string", description: "Descripción corta y clara, ej: Supermercado, Nafta, Sueldo." },
              categoria: {
                type: "string",
                description: data.categorias.length
                  ? `Elegí la que mejor aplique de esta lista: ${data.categorias.join(", ")}. Si ninguna aplica bien, dejar vacío.`
                  : "Dejar vacío si no hay categorías configuradas.",
              },
            },
            required: ["tipo", "monto", "descripcion"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "registrar_movimiento" },
      messages: [
        {
          role: "user",
          content: `Hoy es ${data.fechaHoy}. Extraé los datos de este movimiento: "${texto}"`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("No pude entender ese texto, probá describirlo de otra forma");
    }

    const parsed = toolUse.input as { tipo?: string; monto?: number; descripcion?: string; categoria?: string };
    if (!parsed.monto || !parsed.descripcion) {
      throw new Error("No pude entender ese texto, probá describirlo de otra forma");
    }

    return {
      configured: true as const,
      tipo: parsed.tipo === "Ingreso" ? "Ingreso" : "Gasto",
      monto: String(parsed.monto),
      descripcion: parsed.descripcion,
      categoria: parsed.categoria ?? "",
      fecha: data.fechaHoy,
    };
  });
