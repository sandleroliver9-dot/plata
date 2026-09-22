import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PrivacidadContent } from "@/components/app/legal-content";

export const Route = createFileRoute("/privacidad")({
  head: () => ({ meta: [{ title: "Política de Privacidad · Platium" }] }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Política de Privacidad</h1>
          <PrivacidadContent />
        </Card>
      </div>
    </div>
  );
}
