import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { getPaginationOffset, createPaginatedResponse } from '../utils/pagination';
import { PaginatedResponse } from '../types';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type CategoryCreate = {
  nombre: string;
  tipo: string;
  color?: string | null;
  prioridad?: string | null;
};

export const CategoriesService = {
  async list(userId: string, page: number = 1, limit: number = env.DEFAULT_PAGE_SIZE): Promise<PaginatedResponse<any>> {
    const supabase = getSupabaseClient();
    const offset = getPaginationOffset(page, limit);

    // Get paginated data
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('nombre')
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching categories', error);
      throw error;
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activo', true);

    if (countError) {
      logger.error('Error counting categories', countError);
      throw countError;
    }

    logger.debug('Categories fetched', { userId, page, limit, total: count });
    return createPaginatedResponse(data ?? [], count ?? 0, page, limit);
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

    if (error) {
      logger.error('Error creating category', error);
      throw error;
    }

    logger.info('Category created', { userId, categoryId: data?.id });
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

    if (error) {
      logger.error('Error updating category', error);
      throw error;
    }

    logger.info('Category updated', { userId, categoryId: id });
    return data;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('categorias')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting category', error);
      throw error;
    }

    logger.info('Category deleted', { userId, categoryId: id });
    return true;
  },
};
