// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Common entity types
export interface Category {
  id: string;
  user_id: string;
  nombre: string;
  tipo: string;
  color?: string;
  prioridad?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: string;
  categoria?: string;
  cuota?: number;
  descripcion?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  pay_day?: number;
  salary?: number;
  saving_target?: number;
  financial_center?: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  concepto: string;
  monto: number;
  fecha_cobro: string;
  frecuencia?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  concepto: string;
  monto: number;
  fecha_vencimiento: string;
  categoria?: string;
  pagado: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_target?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentBuy {
  id: string;
  user_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  fecha: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentSell {
  id: string;
  user_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  fecha: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentDividend {
  id: string;
  user_id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
