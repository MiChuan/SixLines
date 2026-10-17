import { describe, expect, it } from 'vitest';
import { inferCategory, judgeMatter } from './verdict';

describe('inferCategory', () => {
  it('detects wealth', () => {
    expect(inferCategory('求财是否可成')).toBe('求财');
  });
});

describe('judgeMatter', () => {
  it('returns classical verdict when category known', () => {
    const r = judgeMatter({
      matter: '求财',
      hexagramNature: 'auspicious',
      date: new Date(2024, 5, 1),
    });
    expect('needCategory' in r).toBe(false);
    if (!('needCategory' in r)) {
      expect(['宜', '慎', '忌']).toContain(r.verdict);
      expect(r.text.length).toBeGreaterThan(10);
    }
  });

  it('asks for category when unclear', () => {
    const r = judgeMatter({
      matter: '某某',
      hexagramNature: 'neutral',
    });
    expect('needCategory' in r).toBe(true);
  });
});
