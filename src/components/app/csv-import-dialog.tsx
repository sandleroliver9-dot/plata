import { useState } from "react";
import Papa from "papaparse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { financialMonth } from "@/lib/finance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Row = { fecha: string; descripcion: string; monto: number; tipo: string; categoria?: string; medio?: string };

function parseImportAmount(value: unknown): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : lastDot > -1 ? "." : "";
  const normalized = cleaned
    .replace(/[.,]/g, (ch) => (ch === decimalSep ? "." : ""))
    .replace(/(?!^)-/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function CsvImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [parsed, setParsed] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filename, setFilename] = useState("");

  function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Archivo > 5MB"); return; }
    setFilename(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows: Row[] = [];
        const errs: string[] = [];
        (res.data as any[]).slice(0, 500).forEach((r, i) => {
          const fecha = (r.fecha || r.Fecha || r.date || "").toString().slice(0, 10);
          const descripcion = (r.descripcion || r.Descripcion || r.description || r.detalle || "").toString().trim().slice(0, 200);
          const montoParsed = parseImportAmount(r.monto || r.Monto || r.amount);
          const monto = Math.abs(Number(montoParsed));
          let tipo = (r.tipo || r.Tipo || "").toString();
          if (!tipo) tipo = Number(montoParsed ?? 0) < 0 ? "Gasto" : "Ingreso";
          tipo = tipo.toLowerCase().startsWith("i") ? "Ingreso" : "Gasto";
          if (!fecha || !descripcion || !Number.isFinite(monto) || monto <= 0) {
            errs.push(`Fila ${i + 2}: datos incompletos`);
            return;
          }
          rows.push({
            fecha, descripcion, monto, tipo,
            categoria: (r.categoria || r.Categoria || "").toString().trim() || undefined,
            medio: (r.medio || r.Medio || "").toString().trim() || undefined,
          });
        });
        setParsed(rows);
        setErrors(errs.slice(0, 5));
      },
      error: () => toast.error("No pude leer el archivo"),
    });
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!user || !parsed.length) return;
      const payDay = profile?.pay_day ?? 1;
      const batch = parsed.map(r => ({
        user_id: user.id,
        tipo: r.tipo,
        descripcion: r.descripcion,
        monto: r.monto,
        fecha: r.fecha,
        mes_financiero: financialMonth(new Date(r.fecha), payDay),
        categoria: r.categoria ?? null,
        medio: r.medio ?? null,
      }));
      const { error } = await supabase.from("movimientos").insert(batch);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Importé ${parsed.length} movimientos`);
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    },
    onError: () => toast.error("Falló la importación"),
  });

  function reset() { setParsed([]); setErrors([]); setFilename(""); }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar CSV</DialogTitle>
          <DialogDescription>
            Columnas esperadas: <code className="text-xs">fecha, descripcion, monto, tipo, categoria, medio</code>. Máx. 500 filas.
          </DialogDescription>
        </DialogHeader>

        {!parsed.length ? (
          <label className="block border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm">Seleccioná un archivo CSV</p>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        ) : (
          <div className="space-y-3">
            <Card className="p-3 flex items-center gap-3">
              <FileText className="size-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{filename}</p>
                <p className="text-xs text-muted-foreground">{parsed.length} filas listas{errors.length ? ` · ${errors.length}+ errores` : ""}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Cambiar</Button>
            </Card>

            {errors.length > 0 && (
              <div className="text-xs text-warning bg-warning/10 p-2 rounded">
                {errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}

            <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 sticky top-0">
                  <tr className="text-left">
                    <th className="p-2">Fecha</th><th className="p-2">Descripción</th><th className="p-2">Tipo</th><th className="p-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2">{r.fecha}</td>
                      <td className="p-2 truncate max-w-[200px]">{r.descripcion}</td>
                      <td className="p-2"><Badge variant="secondary" className="text-xs">{r.tipo}</Badge></td>
                      <td className="p-2 text-right num">{r.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 50 && <p className="text-xs text-muted-foreground p-2">+{parsed.length - 50} filas más...</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Importando..." : `Importar ${parsed.length}`}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
