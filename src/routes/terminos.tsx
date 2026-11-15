import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { TerminosContent } from "@/components/app/legal-content";
import { PLATIUM_CARD } from "@/components/app/platium-ui";

export const Route = createFileRoute("/terminos")({
  head: () => ({ meta: [{ title: "Términos y Condiciones · Platium" }] }),
  component: TerminosPage,
});

function TerminosPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-[#111]">
      <div className="max-w-2xl mx-auto">
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-[#70706a] hover:text-[#20376b] mb-6 font-plus-jakarta">
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <div className={`${PLATIUM_CARD} p-6 md:p-8`}>
          <h1 className="text-2xl font-bold text-[#20376b] mb-4 font-plus-jakarta">Términos y Condiciones</h1>
          <TerminosContent />
        </div>
      </div>
    </div>
  );
}
