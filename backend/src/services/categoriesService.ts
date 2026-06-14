import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type CategoryCreate = {
  nombre: string;
  tipo: string;
  color?: string | null;
  prioridad?: string | null;
};

export const CategoriesService = {
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  },

  async create(userId: string, payload: CategoryCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        user_id: userId,
        nombre: payload.nombre,
        tipo: payload.tipo,
        color: payload.color ?? null,
        prioridad: payload.prioridad ?? null,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, payload: Partial<CategoryCreate>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categorias')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('categorias')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
