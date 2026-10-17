import type { CastingResult, LineResult } from './types';
import { tossThreeCoins, type Rng, cryptoRng } from './coins';

/**
 * 二进制 → 文王序。bit0 = 初爻（最下），1=阳 0=阴。
 * 校验：全阳 0b111111→乾1，全阴 0b000000→坤2。
 */
export const BIN2WEN: number[] = (() => {
  const t = new Array<number>(64).fill(0);
  const pairs: [number, number][] = [
    [0b111111, 1], [0b000000, 2], [0b010001, 3], [0b100010, 4],
    [0b010111, 5], [0b111010, 6], [0b000010, 7], [0b010000, 8],
    [0b110111, 9], [0b111011, 10], [0b000111, 11], [0b111000, 12],
    [0b111101, 13], [0b101111, 14], [0b000100, 15], [0b001000, 16],
    [0b011001, 17], [0b100110, 18], [0b000011, 19], [0b110000, 20],
    [0b101001, 21], [0b100101, 22], [0b100000, 23], [0b000001, 24],
    [0b111001, 25], [0b100111, 26], [0b100001, 27], [0b011110, 28],
    [0b010010, 29], [0b101101, 30], [0b011100, 31], [0b001110, 32],
    [0b111100, 33], [0b001111, 34], [0b101000, 35], [0b000101, 36],
    [0b110101, 37], [0b101011, 38], [0b010100, 39], [0b001010, 40],
    [0b100011, 41], [0b110001, 42], [0b011111, 43], [0b111110, 44],
    [0b011000, 45], [0b000110, 46], [0b011010, 47], [0b010110, 48],
    [0b101110, 49], [0b011101, 50], [0b001001, 51], [0b100100, 52],
    [0b110100, 53], [0b001011, 54], [0b001101, 55], [0b101100, 56],
    [0b110110, 57], [0b011011, 58], [0b110010, 59], [0b010011, 60],
    [0b110011, 61], [0b001100, 62], [0b101010, 63], [0b010101, 64],
  ];
  for (const [bin, id] of pairs) t[bin] = id;
  return t;
})();

export function binaryToKingWen(bits: number): number {
  const id = BIN2WEN[bits & 63];
  if (!id) throw new Error(`未知卦象二进制: ${bits}`);
  return id;
}

export function linesToBinary(yangFlags: boolean[]): number {
  let bits = 0;
  for (let i = 0; i < 6; i++) {
    if (yangFlags[i]) bits |= 1 << i;
  }
  return bits;
}

export function linesToHexagram(lines: LineResult[]): CastingResult {
  if (lines.length !== 6) throw new Error('需六爻');
  const primaryFlags = lines.map((l) => l.yinYang === 'yang');
  const primary = binaryToKingWen(linesToBinary(primaryFlags));
  const changingIndexes = lines
    .map((l, i) => (l.changing ? i : -1))
    .filter((i) => i >= 0);
  let changed: number | undefined;
  if (changingIndexes.length > 0) {
    const changedFlags = lines.map((l) => {
      if (!l.changing) return l.yinYang === 'yang';
      return l.yinYang !== 'yang';
    });
    changed = binaryToKingWen(linesToBinary(changedFlags));
  }
  return { lines, primary, changed, changingIndexes };
}

export function castHexagram(rng: Rng = cryptoRng): CastingResult {
  const lines: LineResult[] = [];
  for (let i = 0; i < 6; i++) lines.push(tossThreeCoins(rng));
  return linesToHexagram(lines);
}

export function lineSymbol(line: LineResult): string {
  if (line.value === 6) return '— — ×';
  if (line.value === 7) return '—————';
  if (line.value === 8) return '— —';
  return '————— ○';
}
