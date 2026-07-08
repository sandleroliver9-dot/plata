import { useState } from "react";
import Papa from "papaparse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { financialMonth } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";
import { parseNumberInput } from "@/lib/number-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Row = { fecha: string; descripcion: string; monto: number; tipo: string; categoria?: string; medio?: string };

export function CsvImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [parsed, setParsed] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
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
        const totalRows = (res.data as any[]).length;
        (res.data as any[]).slice(0, 500).forEach((r, i) => {
          const fecha = (r.fecha || r.Fecha || r.date || "").toString().slice(0, 10);
          const descripcion = (r.descripcion || r.Descripcion || r.description || r.detalle || "").toString().trim().slice(0, 200);
          const montoParsed = parseNumberInput(r.monto || r.Monto || r.amount);
          const monto = Math.abs(montoParsed);
          let tipo = (r.tipo || r.Tipo || "").toString();
          if (!tipo) tipo = montoParsed < 0 ? "Gasto" : "Ingreso";
          tipo = tipo.toLowerCase().startsWith("i") ? "Ingreso" : "Gasto";
          if (!fecha || !descripcion || !Number.isFinite(monto) || monto <= 0) {
            errs.push(`Fila ${i + 2}: datos incompletos`);
            return;
          }
          // Una fecha con formato invalido (ej: DD/MM/YYYY en vez de
          // YYYY-MM-DD) pasaba el chequeo de arriba (string no vacio) y mas
          // adelante financialMonth() la convertia en un Invalid Date sin
          // tirar error, insertando la fila con mes_financiero = "undefined
          // NaN" y haciendola desaparecer de todas las pantallas mensuales
          // sin ningun aviso.
          if (!parseISODate(fecha)) {
            errs.push(`Fila ${i + 2}: fecha inválida (esperado AAAA-MM-DD)`);
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
        setErrorCount(errs.length);
        if (totalRows > 500) {
          toast.warning(`El archivo tiene ${totalRows} filas: solo se importan las primeras 500.`);
        }
      },
      error: () => toast.error("No pude leer el archivo"),
    });
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Iniciá sesión de nuevo antes de importar");
      if (!parsed.length) throw new Error("No hay filas para importar");
      const payDay = profile?.pay_day ?? 1;
      const batch = parsed.map(r => ({
        user_id: user.id,
        tipo: r.tipo,
        descripcion: r.descripcion,
        monto: r.monto,
        fecha: r.fecha,
        // new Date(r.fecha) parsea "YYYY-MM-DD" como UTC medianoche: en
        // Argentina (UTC-3) cada fila importada podia caer en el mes
        // financiero anterior al real. Mismo bug que ya se arreglo en
        // ingresos.tsx y movimiento-dialog.tsx.
        mes_financiero: financialMonth(parseISODate(r.fecha) ?? new Date(r.fecha), payDay),
        categoria: r.categoria ?? null,
        medio: r.medio ?? null,
      }));

      // Reimportar el mismo CSV (o uno que se superpone) duplicaba montos sin
      // avisar. Se descartan filas que ya existan como movimiento activo con
      // la misma fecha+descripcion+monto+tipo antes de insertar.
      const mesesAfectados = Array.from(new Set(batch.map((b) => b.mes_financiero)));
      const { data: existentes, error: fetchError } = await supabase
        .from("movimientos")
        .select("fecha,descripcion,monto,tipo")
        .eq("activo", true)
        .in("mes_financiero", mesesAfectados);
      if (fetchError) throw fetchError;

      const clave = (r: { fecha: string; descripcion: string | null; monto: number; tipo: string }) =>
        `${r.fecha}|${(r.descripcion ?? "").trim().toLowerCase()}|${Number(r.monto).toFixed(2)}|${r.tipo}`;
      const existentesSet = new Set((existentes ?? []).map(clave));
      const vistasEnEsteArchivo = new Set<string>();
      const aInsertar = batch.filter((b) => {
        const k = clave(b);
        if (existentesSet.has(k) || vistasEnEsteArchivo.has(k)) return false;
        vistasEnEsteArchivo.add(k);
        return true;
      });
      const duplicados = batch.length - aInsertar.length;

      if (aInsertar.length > 0) {
        const { error } = await supabase.from("movimientos").insert(aInsertar);
        if (error) throw error;
      }
      return { insertados: aInsertar.length, duplicados };
    },
    onSuccess: (result) => {
      if (!result) return;
      if (result.insertados === 0) {
        toast.info(`Las ${result.duplicados} filas ya estaban importadas, no se agregó nada nuevo.`);
      } else {
        toast.success(`Importé ${result.insertados} movimientos${result.duplicados ? ` (${result.duplicados} ya existían y se omitieron)` : ""}`);
      }
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Falló la importación"),
  });

  function reset() { setParsed([]); setErrors([]); setErrorCount(0); setFilename(""); }

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
                <p className="text-xs text-muted-foreground">{parsed.length} filas listas{errorCount ? ` · ${errorCount} error${errorCount === 1 ? "" : "es"}` : ""}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Cambiar</Button>
            </Card>

            {errors.length > 0 && (
              <div className="text-xs text-warning bg-warning/10 p-2 rounded">
                {errors.map((e, i) => <div key={i}>{e}</div>)}
                {errorCount > errors.length && <div>+{errorCount - errors.length} error{errorCount - errors.length === 1 ? "" : "es"} más</div>}
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
