import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PLATIUM_PAGE_TITLE, PLATIUM_PAGE_SUBTITLE } from "@/components/app/platium-ui";

export function SettingsSubpageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <Link to="/configuracion" className="inline-flex items-center gap-1.5 text-sm text-[#70706a] hover:text-[#20376b] mb-3 font-plus-jakarta">
        <ArrowLeft className="size-4" /> Volver
      </Link>
      <h1 className={PLATIUM_PAGE_TITLE}>{title}</h1>
      <p className={`${PLATIUM_PAGE_SUBTITLE} mt-1`}>{subtitle}</p>
    </header>
  );
}
