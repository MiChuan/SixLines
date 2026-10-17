import { describe, expect, it } from 'vitest';
import { getDayPillar, getDayPillars, relation } from './ganzhi';

describe('getDayPillar', () => {
  it('1900-01-01 is 甲戌', () => {
    const d = getDayPillar(new Date(1900, 0, 1));
    expect(d.text).toBe('甲戌');
  });
});

describe('getDayPillars', () => {
  it('returns year month day', () => {
    const p = getDayPillars(new Date(2024, 0, 1));
    expect(p.year).toHaveLength(2);
    expect(p.month).toHaveLength(2);
    expect(p.day).toHaveLength(2);
  });
});

describe('relation', () => {
  it('wood generates fire', () => {
    expect(relation('木', '火')).toBe('生');
  });
  it('wood conquers earth', () => {
    expect(relation('木', '土')).toBe('克');
  });
});
