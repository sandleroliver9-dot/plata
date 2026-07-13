import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { todayISO } from "@/lib/finance";
import { parseQuickEntry } from "@/lib/quick-entry.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Form as MovimientoDefaults } from "@/components/app/movimiento-dialog";

export function QuickEntryDialog({
  open,
  onOpenChange,
  categorias,
  onParsed,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: string[];
  onParsed: (defaults: Partial<MovimientoDefaults>) => void;
}) {
  const [texto, setTexto] = useState("");
  const parse = useServerFn(parseQuickEntry);

  const mut = useMutation({
    mutationFn: async () => {
      if (!texto.trim()) throw new Error("Escribí algo primero");
      return parse({ data: { texto, categorias, fechaHoy: todayISO() } });
    },
    onSuccess: (result) => {
      if (!result.configured) {
        toast.info("La carga rápida por IA todavía no está configurada en esta cuenta.");
        return;
      }
      onParsed({
        tipo: result.tipo,
        monto: result.monto,
        descripcion: result.descripcion,
        categoria: result.categoria,
        fecha: result.fecha,
      });
      setTexto("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="size-4" />Carga rápida</DialogTitle>
          <DialogDescription>Escribí lo que gastaste o cobraste, en tus palabras. Después vas a poder revisar y confirmar antes de guardar.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: gasté 8000 en el supermercado, o cobré 50000 de un trabajo freelance"
          rows={3}
          autoFocus
        />
        <DialogFooter>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !texto.trim()}>
            {mut.isPending ? "Interpretando..." : "Interpretar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
