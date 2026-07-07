import { describe, expect, it } from 'vitest';
import { incomeCreateSchema } from './income';

describe('incomeCreateSchema', () => {
  const base = { concepto: 'Sueldo', monto: 500000, fecha_cobro: '2026-06-25' };

  it('accepts a valid payload', () => {
    expect(incomeCreateSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a non-ISO fecha_cobro', () => {
    const result = incomeCreateSchema.safeParse({ ...base, fecha_cobro: '25/06/2026' });
    expect(result.success).toBe(false);
  });

  it('rejects a tipo outside the DB check constraint', () => {
    const result = incomeCreateSchema.safeParse({ ...base, tipo: 'NoExiste' });
    expect(result.success).toBe(false);
  });

  it('accepts every tipo allowed by the DB check constraint', () => {
    for (const tipo of ['Sueldo', 'Bono', 'Aguinaldo', 'Extra', 'Otro']) {
      expect(incomeCreateSchema.safeParse({ ...base, tipo }).success).toBe(true);
    }
  });
});
