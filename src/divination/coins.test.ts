import { describe, expect, it } from 'vitest';
import { createSeededRng, sumToLine, tossThreeCoins } from './coins';

describe('sumToLine', () => {
  it('maps 6/7/8/9 correctly', () => {
    expect(sumToLine(6)).toEqual({ value: 6, yinYang: 'yin', changing: true });
    expect(sumToLine(7)).toEqual({ value: 7, yinYang: 'yang', changing: false });
    expect(sumToLine(8)).toEqual({ value: 8, yinYang: 'yin', changing: false });
    expect(sumToLine(9)).toEqual({ value: 9, yinYang: 'yang', changing: true });
  });
});

describe('tossThreeCoins', () => {
  it('sum equals coin face values', () => {
    const line = tossThreeCoins(createSeededRng(42));
    const sum = line.coins.reduce((a, c) => a + (c ? 3 : 2), 0);
    expect(sum).toBe(line.value);
  });
});
