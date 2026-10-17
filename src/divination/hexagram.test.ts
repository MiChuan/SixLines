import { describe, expect, it } from 'vitest';
import { binaryToKingWen, linesToHexagram } from './hexagram';
import type { LineResult } from './types';

function L(value: 6 | 7 | 8 | 9): LineResult {
  const map = {
    6: { value: 6 as const, yinYang: 'yin' as const, changing: true, coins: [false, false, false] as [boolean, boolean, boolean] },
    7: { value: 7 as const, yinYang: 'yang' as const, changing: false, coins: [true, true, false] as [boolean, boolean, boolean] },
    8: { value: 8 as const, yinYang: 'yin' as const, changing: false, coins: [false, false, true] as [boolean, boolean, boolean] },
    9: { value: 9 as const, yinYang: 'yang' as const, changing: true, coins: [true, true, true] as [boolean, boolean, boolean] },
  };
  return map[value];
}

describe('binaryToKingWen', () => {
  it('maps qian and kun', () => {
    expect(binaryToKingWen(0b111111)).toBe(1);
    expect(binaryToKingWen(0b000000)).toBe(2);
  });
});

describe('linesToHexagram', () => {
  it('all young yang is qian', () => {
    const r = linesToHexagram([L(7), L(7), L(7), L(7), L(7), L(7)]);
    expect(r.primary).toBe(1);
    expect(r.changed).toBeUndefined();
  });

  it('old yin bottom changes toward yang', () => {
    const r = linesToHexagram([L(6), L(7), L(7), L(7), L(7), L(7)]);
    expect(r.primary).toBe(binaryToKingWen(0b111110)); // bottom yin
    expect(r.changed).toBe(1);
    expect(r.changingIndexes).toEqual([0]);
  });
});
