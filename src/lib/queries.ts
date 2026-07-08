import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const categoriasQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["categorias", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("user_id", userId as string)
        .eq("activo", true)
        .order("nombre");
      if (error) throw error;
      return data ?? [];
    },
  });
