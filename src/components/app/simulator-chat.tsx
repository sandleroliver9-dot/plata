import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { MessageCircleQuestion, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { simulateScenario } from "@/lib/simulator.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Turno = { role: "user" | "assistant"; content: string };
type ProyeccionMes = { mes: string; ingresos: number; gastos: number; disponible: number };

const SUGERENCIAS = [
  "Si compro algo de $300.000 en 6 cuotas, ¿cómo quedo?",
  "¿Cuánto me queda libre los próximos 3 meses?",
];

export function SimulatorChat({ proyeccion, currency }: { proyeccion: ProyeccionMes[]; currency: string }) {
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
          proyeccion: proyeccion.map((m) => ({ mes: m.mes, ingresos: m.ingresos, gastos: m.gastos, disponible: m.disponible })),
        },
      });
    },
    onSuccess: (result, pregunta) => {
      if (!result.configured) {
        toast.info("El simulador por IA todavía no está configurado en esta cuenta.");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Sparkles className="size-4 mr-2" />Simulador</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircleQuestion className="size-4" />Simulador de escenarios</DialogTitle>
          <DialogDescription>
            Preguntá cómo quedarían tus próximos meses con una compra, cuotas, etc. Te muestra los números — la decisión siempre es tuya, no da consejos.
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
              <div className="rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">Calculando escenario...</div>
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
            placeholder="Ej: ¿si compro algo de $500.000 en 12 cuotas?"
            maxLength={500}
          />
          <Button type="submit" size="icon" disabled={mut.isPending || !texto.trim()}><Send className="size-4" /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
