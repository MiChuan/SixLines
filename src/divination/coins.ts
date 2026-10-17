import type { LineResult, LineValue } from './types';

export type Rng = () => number;

/** crypto 随机，返回 [0,1) */
export function cryptoRng(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! / 2 ** 32;
}

export function createSeededRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** 掷一枚：true=字(阳)，false=背(阴) */
export function tossCoin(rng: Rng = cryptoRng): boolean {
  return rng() < 0.5;
}

export function sumToLine(sum: 6 | 7 | 8 | 9): Omit<LineResult, 'coins'> {
  const map: Record<LineValue, Omit<LineResult, 'coins'>> = {
    6: { value: 6, yinYang: 'yin', changing: true },
    7: { value: 7, yinYang: 'yang', changing: false },
    8: { value: 8, yinYang: 'yin', changing: false },
    9: { value: 9, yinYang: 'yang', changing: true },
  };
  return map[sum];
}

/** 摇三钱得一爻 */
export function tossThreeCoins(rng: Rng = cryptoRng): LineResult {
  const coins: [boolean, boolean, boolean] = [
    tossCoin(rng),
    tossCoin(rng),
    tossCoin(rng),
  ];
  const sum = coins.reduce<number>((a, c) => a + (c ? 3 : 2), 0) as LineValue;
  return { ...sumToLine(sum), coins };
}
