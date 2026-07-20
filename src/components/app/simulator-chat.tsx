import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { MessageCircleQuestion, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { simulateScenario } from "@/lib/simulator.functions";
import { useProjectionSummary } from "@/hooks/use-projection-summary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Turno = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "Si compro algo de $300.000 en 6 cuotas, ¿cómo quedo?",
  "¿Cuánto me queda libre los próximos 3 meses?",
  "¿Qué es el interés compuesto?",
];

export function SimulatorChat() {
  const { rows, currency } = useProjectionSummary();
  const [open, setOpen] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const simulate = useServerFn(simulateScenario);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turnos]);

  const mut = useMutation({
    mutationFn: async (pregunta: string) => {
      return simulate({
        data: {
          pregunta,
          historial: turnos,
          moneda: currency,
          proyeccion: rows.map((m) => ({ mes: m.mes, ingresos: m.ingresos, gastos: m.total, disponible: m.disponible })),
        },
      });
    },
    onSuccess: (result, pregunta) => {
      if (!result.configured) {
        toast.info("El chat con la IA todavía no está configurado en esta cuenta.");
        return;
      }
      setTurnos((prev) => [...prev, { role: "user", content: pregunta }, { role: "assistant", content: result.respuesta }]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (!limpia || mut.isPending) return;
    setTexto("");
    mut.mutate(limpia);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-20 right-4 z-40 shadow-lg rounded-full h-12 w-12 p-0"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="Abrir chat con la IA"
      >
        <Sparkles className="size-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageCircleQuestion className="size-4" />Chat con la IA</DialogTitle>
            <DialogDescription>
              Preguntame lo que quieras sobre tus finanzas, simulá un escenario (compras, cuotas) o resolvé dudas generales. Te muestra los números y explica — la decisión siempre es tuya, no da consejos.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-32">
            {turnos.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Probá con:</p>
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="block w-full text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-accent"
                    onClick={() => enviar(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turnos.map((t, i) => (
              <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {t.content}
                </div>
              </div>
            ))}
            {mut.isPending && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">Pensando...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 pt-2 border-t border-border"
            onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
          >
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Preguntame lo que quieras..."
              maxLength={500}
            />
            <Button type="submit" size="icon" disabled={mut.isPending || !texto.trim()}><Send className="size-4" /></Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
