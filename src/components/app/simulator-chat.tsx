import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, Send, Sparkles, Mic, MicOff, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { simulateScenario } from "@/lib/simulator.functions";
import { useProjectionSummary } from "@/hooks/use-projection-summary";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { categoriasQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { financialMonth, formatMoney, todayISO } from "@/lib/finance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovimientoDialog, type Form as MovimientoDefaults } from "@/components/app/movimiento-dialog";

type MovimientoParseado = { tipo: "Ingreso" | "Gasto"; monto: string; descripcion: string; categoria: string; fecha: string };
type Turno =
  | { role: "user" | "assistant"; content: string }
  | { role: "confirm"; movimiento: MovimientoParseado; status: "pending" | "guardado" | "descartado" };

const SUGERENCIAS = [
  "Si compro algo de $300.000 en 6 cuotas, ¿cómo quedo?",
  "¿Cuánto me queda libre los próximos 3 meses?",
  "Fui al kiosco y gasté 5000",
];

// Dictado por voz: Web Speech API, nativa del navegador (sin subir audio a
// ningún servidor ni depender de otra cuenta/API key). Safari/iOS y Chrome
// la soportan con prefijo `webkit`; si no está disponible, el botón de
// micrófono ni se muestra.
function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function SimulatorChat() {
  const { rows, currency } = useProjectionSummary();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: cats } = useQuery(categoriasQuery(user?.id));
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [editDefaults, setEditDefaults] = useState<Partial<MovimientoDefaults> | undefined>(undefined);
  const simulate = useServerFn(simulateScenario);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turnos]);

  const mut = useMutation({
    mutationFn: async (pregunta: string) => {
      return simulate({
        data: {
          pregunta,
          historial: turnos.filter((t): t is Extract<Turno, { role: "user" | "assistant" }> => t.role === "user" || t.role === "assistant"),
          moneda: currency,
          proyeccion: rows.map((m) => ({ mes: m.mes, ingresos: m.ingresos, gastos: m.total, disponible: m.disponible })),
          categorias: (cats ?? []).map((c: any) => c.nombre),
          fechaHoy: todayISO(),
        },
      });
    },
    onSuccess: (result, pregunta) => {
      if (!result.configured) {
        toast.info("El chat con la IA todavía no está configurado en esta cuenta.");
        return;
      }
      if (result.type === "registrar") {
        setTurnos((prev) => [...prev, { role: "user", content: pregunta }, { role: "confirm", movimiento: result.movimiento, status: "pending" }]);
        return;
      }
      setTurnos((prev) => [...prev, { role: "user", content: pregunta }, { role: "assistant", content: result.respuesta }]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const guardarMut = useMutation({
    mutationFn: async (movimiento: MovimientoParseado) => {
      if (!user) throw new Error();
      const monto = Number(movimiento.monto);
      const mes_financiero = financialMonth(new Date(`${movimiento.fecha}T00:00:00`), profile?.pay_day ?? 1);
      const { error } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: movimiento.tipo,
        descripcion: movimiento.descripcion.trim().slice(0, 200),
        monto,
        fecha: movimiento.fecha,
        mes_financiero,
        categoria: movimiento.categoria || null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, movimiento) => {
      toast.success("Movimiento cargado");
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setTurnos((prev) => prev.map((t) => (t.role === "confirm" && t.movimiento === movimiento ? { ...t, status: "guardado" } : t)));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (!limpia || mut.isPending) return;
    setTexto("");
    mut.mutate(limpia);
  }

  function descartar(movimiento: MovimientoParseado) {
    setTurnos((prev) => prev.map((t) => (t.role === "confirm" && t.movimiento === movimiento ? { ...t, status: "descartado" } : t)));
  }

  function editar(movimiento: MovimientoParseado) {
    setEditDefaults({ tipo: movimiento.tipo, monto: movimiento.monto, descripcion: movimiento.descripcion, categoria: movimiento.categoria, fecha: movimiento.fecha });
    descartar(movimiento);
  }

  function toggleMic() {
    if (escuchando) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      toast.info("Tu navegador no soporta dictado por voz — escribí el mensaje.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setEscuchando(true);
    recognition.onend = () => setEscuchando(false);
    recognition.onerror = () => {
      setEscuchando(false);
      toast.error("No pude escucharte, probá de nuevo o escribí el mensaje.");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) enviar(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const speechSupported = Boolean(getSpeechRecognition());

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
              Preguntame, simulá un escenario, o contame un gasto/ingreso real ("fui al kiosco, gasté 5000") y te lo dejo listo para confirmar. Nunca guardo nada sin que lo confirmes vos.
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
            {turnos.map((t, i) => {
              if (t.role === "confirm") {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[90%] w-full rounded-lg border border-border bg-muted p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{t.movimiento.descripcion}</span>
                        <span className={`num font-semibold ${t.movimiento.tipo === "Ingreso" ? "text-success" : ""}`}>
                          {t.movimiento.tipo === "Ingreso" ? "+" : "-"}{formatMoney(Number(t.movimiento.monto), currency)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.movimiento.tipo} · {t.movimiento.categoria || "Sin categoría"} · {t.movimiento.fecha}
                      </div>
                      {t.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => guardarMut.mutate(t.movimiento)} disabled={guardarMut.isPending}>
                            <Check className="size-4 mr-1" />Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editar(t.movimiento)}>
                            <Pencil className="size-4 mr-1" />Editar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => descartar(t.movimiento)}>
                            <X className="size-4 mr-1" />Descartar
                          </Button>
                        </div>
                      )}
                      {t.status === "guardado" && <div className="text-xs text-success">✓ Guardado</div>}
                      {t.status === "descartado" && <div className="text-xs text-muted-foreground">Descartado</div>}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {t.content}
                  </div>
                </div>
              );
            })}
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
              placeholder={escuchando ? "Escuchando..." : "Preguntame lo que quieras..."}
              maxLength={500}
              disabled={escuchando}
            />
            {speechSupported && (
              <Button
                type="button"
                size="icon"
                variant={escuchando ? "default" : "outline"}
                onClick={toggleMic}
                aria-label={escuchando ? "Detener dictado" : "Dictar por voz"}
              >
                {escuchando ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
            )}
            <Button type="submit" size="icon" disabled={mut.isPending || !texto.trim()}><Send className="size-4" /></Button>
          </form>
        </DialogContent>
      </Dialog>

      <MovimientoDialog
        open={Boolean(editDefaults)}
        onOpenChange={(o) => { if (!o) setEditDefaults(undefined); }}
        defaults={editDefaults}
      />
    </>
  );
}
