import { PaginationParams, PaginatedResponse } from '../types';
import { env } from '../config/env';
import { ValidationError } from './errors';

export const parsePaginationParams = (page?: unknown, limit?: unknown): PaginationParams => {
  const pageNum = parseInt(String(page) || '1', 10);
  const limitNum = parseInt(String(limit) || String(env.DEFAULT_PAGE_SIZE), 10);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive integer', { page });
  }

  if (isNaN(limitNum) || limitNum < 1) {
    throw new ValidationError('Limit must be a positive integer', { limit });
  }

  if (limitNum > env.MAX_PAGE_SIZE) {
    throw new ValidationError(`Limit cannot exceed ${env.MAX_PAGE_SIZE}`, { limit, maxAllowed: env.MAX_PAGE_SIZE });
  }

  return { page: pageNum, limit: limitNum };
};

export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Supabase query builder with pagination
export const buildPaginatedQuery = (
  query: any,
  page: number,
  limit: number,
  orderBy: string = 'created_at',
  ascending: boolean = false
) => {
  const offset = getPaginationOffset(page, limit);
  return query
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);
};

export const getCountFromResponse = (response: any): number => {
  // Supabase returns count in headers when using .range()
  // For this we need to make a separate count query
  return 0;
};
