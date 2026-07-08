import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { supabase } from "@/integrations/supabase/client";

export const categoriasQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["categorias", userId],
    enabled: !!userId,
    queryFn: async () => {
      // Antes pasaba por apiClient (backend Express en VITE_API_URL/localhost:3000),
      // que no corre en el deploy real: el fetch fallaba siempre, dejando esta
      // query en error permanente. Ademas de perder los colores/categorias reales
      // del usuario (se caia al fallback generico), disparaba requests fallidos
      // en cada carga de Gastos fijos, Movimientos y el dialogo de Nuevo movimiento.
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

export const profileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiClient.profile.get();
      return data;
    },
  });

export const transactionsQuery = (userId: string | undefined, month?: string) =>
  queryOptions({
    queryKey: ["transactions", userId, month],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiClient.transactions.list(month);
      return data ?? [];
    },
  });

export const incomeQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["income", userId],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiClient.income.list();
      return data ?? [];
    },
  });

export const billsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["bills", userId],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiClient.bills.list();
      return data ?? [];
    },
  });

export const goalsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["goals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const data = await apiClient.goals.list();
      return data ?? [];
    },
  });

export const investmentsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["investments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [buys, sells, dividends] = await Promise.all([
        apiClient.investments.listBuys(),
        apiClient.investments.listSells(),
        apiClient.investments.listDividends(),
      ]);
      return { buys: buys ?? [], sells: sells ?? [], dividends: dividends ?? [] };
    },
  });

export const quotesQuery = () =>
  queryOptions({
    queryKey: ["quotes"],
    queryFn: async () => {
      const [dolares, inflacion] = await Promise.all([
        apiClient.quotes.getDolares(),
        apiClient.quotes.getInflacion(),
      ]);
      return { dolares, inflacion };
    },
  });
