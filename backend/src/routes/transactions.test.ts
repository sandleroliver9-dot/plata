import { describe, expect, it } from 'vitest';
import { transactionCreateSchema } from './transactions';

describe('transactionCreateSchema', () => {
  const base = { fecha: '2026-06-25', monto: 1000, tipo: 'Gasto' as const };

  it('accepts a valid payload', () => {
    expect(transactionCreateSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a tipo outside the DB check constraint', () => {
    const result = transactionCreateSchema.safeParse({ ...base, tipo: 'Transferencia' });
    expect(result.success).toBe(false);
  });

  it('accepts Ingreso and Gasto', () => {
    expect(transactionCreateSchema.safeParse({ ...base, tipo: 'Ingreso' }).success).toBe(true);
    expect(transactionCreateSchema.safeParse({ ...base, tipo: 'Gasto' }).success).toBe(true);
  });

  it('rejects a malformed fecha', () => {
    const result = transactionCreateSchema.safeParse({ ...base, fecha: '2026/06/25' });
    expect(result.success).toBe(false);
  });
});
