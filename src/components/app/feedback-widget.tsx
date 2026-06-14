import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FeedbackWidget() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("sugerencia");
  const [severidad, setSeveridad] = useState("media");
  const [mensaje, setMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!user || !mensaje.trim()) return;
    if (mensaje.length > 2000) {
      toast.error("Máximo 2000 caracteres");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      tipo,
      severidad,
      mensaje: mensaje.trim(),
      pagina: pathname,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No pude enviar tu feedback");
      return;
    }
    toast.success("¡Gracias! Tu feedback se envió.");
    setMensaje("");
    setOpen(false);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-4 right-4 z-40 shadow-lg rounded-full h-12 w-12 p-0 md:h-auto md:w-auto md:px-4 md:py-2"
        style={{ background: "var(--gradient-primary)" }}
      >
        <MessageCircle className="size-5 md:mr-2" />
        <span className="hidden md:inline">Feedback</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar feedback</DialogTitle>
            <DialogDescription>Contanos qué encontraste, qué te gustaría o qué falla.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐞 Bug</SelectItem>
                    <SelectItem value="sugerencia">💡 Sugerencia</SelectItem>
                    <SelectItem value="otro">💬 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidad</Label>
                <Select value={severidad} onValueChange={setSeveridad}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Mensaje</Label>
              <Textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Describí lo más claro posible..."
              />
              <p className="text-xs text-muted-foreground mt-1">{mensaje.length}/2000 · Página: {pathname}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={submitting || !mensaje.trim()}>
                {submitting ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
