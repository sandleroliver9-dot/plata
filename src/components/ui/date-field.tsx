import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseISODate } from "@/lib/financial-centers";
import { toISODate } from "@/lib/finance";
import { PLATIUM_INPUT } from "@/components/app/platium-ui";
import { cn } from "@/lib/utils";

// Reemplaza <input type="date"> nativo: en iOS Safari ese control ignora la
// altura que le pongamos (el widget nativo de día/mes/año se renderiza más
// alto que cualquier otro input del mismo formulario, aunque compartan la
// misma clase), dejando esa fila visualmente más grande que el resto. Esto
// es 100% CSS propio (un botón + popover), así que siempre mide igual.
export function DateField({
  value,
  onChange,
  className,
  placeholder = "Elegir fecha",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value) ?? undefined;
  const label = selected
    ? selected.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(PLATIUM_INPUT, "w-full flex items-center justify-between gap-2", className)}
        >
          <span className={cn("truncate", !selected && "text-[#8e8e88]")}>{label}</span>
          <CalendarDays className="size-4 text-[#70706a] shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toISODate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
