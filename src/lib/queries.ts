import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export const categoriasQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["categorias", userId],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiFetch('/categories');
      return data ?? [];
    },
  });
