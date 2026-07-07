import { describe, expect, it } from 'vitest';
import { financialMonth, parseISODateLocal } from './financialMonth';

describe('financialMonth', () => {
  it('matches the calendar month when pay day is the 1st', () => {
    expect(financialMonth(new Date(2026, 5, 1), 1)).toBe('jun 2026');
    expect(financialMonth(new Date(2026, 5, 30), 1)).toBe('jun 2026');
  });

  it('stays in the same financial month on and after pay day', () => {
    expect(financialMonth(new Date(2026, 5, 25), 25)).toBe('jun 2026');
    expect(financialMonth(new Date(2026, 5, 30), 25)).toBe('jun 2026');
  });

  it('rolls back to the previous financial month before pay day', () => {
    expect(financialMonth(new Date(2026, 5, 20), 25)).toBe('may 2026');
  });

  it('rolls over the year boundary correctly', () => {
    expect(financialMonth(new Date(2026, 0, 10), 15)).toBe('dic 2025');
  });

  it('clamps pay day 31 against shorter months instead of overflowing into the next month', () => {
    // 2026 is not a leap year: February has 28 days.
    expect(financialMonth(new Date(2026, 1, 1), 31)).toBe('ene 2026');
    expect(financialMonth(new Date(2026, 1, 27), 31)).toBe('ene 2026');
    expect(financialMonth(new Date(2026, 1, 28), 31)).toBe('feb 2026');
    // April has 30 days.
    expect(financialMonth(new Date(2026, 3, 29), 31)).toBe('mar 2026');
    expect(financialMonth(new Date(2026, 3, 30), 31)).toBe('abr 2026');
  });

  it('falls back to day 1 for invalid pay day input', () => {
    expect(financialMonth(new Date(2026, 5, 15), 0)).toBe('jun 2026');
    expect(financialMonth(new Date(2026, 5, 15), NaN)).toBe('jun 2026');
  });
});

describe('parseISODateLocal', () => {
  it('parses YYYY-MM-DD as local midnight, not UTC', () => {
    const date = parseISODateLocal('2026-06-25');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(25);
  });
});
