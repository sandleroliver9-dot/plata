import { Trash2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { VariantProps } from "class-variance-authority";

type ConfirmDeleteButtonProps = {
  onConfirm: () => void;
  title?: string;
  description?: string;
  disabled?: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
};

// Botón de borrar reutilizable con confirmación: antes cada pantalla borraba
// al primer click del ícono de tacho, sin poder deshacer.
export function ConfirmDeleteButton({
  onConfirm,
  title = "¿Eliminar este elemento?",
  description = "Esta acción no se puede deshacer.",
  disabled,
  size = "icon",
  variant = "ghost",
  className = "text-muted-foreground hover:text-destructive",
}: ConfirmDeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className={className} disabled={disabled}>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
