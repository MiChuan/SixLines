import data from './hexagrams.json';

export type HexagramNature = 'auspicious' | 'neutral' | 'inauspicious';

export interface Hexagram {
  id: number;
  name: string;
  upper: string;
  lower: string;
  judgment: string;
  lines: string[];
  interpretation: string;
  nature: HexagramNature;
}

export const HEXAGRAMS: Hexagram[] = data as Hexagram[];

export function getHexagram(id: number): Hexagram {
  const h = HEXAGRAMS.find((x) => x.id === id);
  if (!h) throw new Error(`无此卦: ${id}`);
  return h;
}

export function searchHexagrams(q: string): Hexagram[] {
  const s = q.trim();
  if (!s) return HEXAGRAMS;
  return HEXAGRAMS.filter(
    (h) =>
      h.name.includes(s) ||
      String(h.id) === s ||
      h.upper.includes(s) ||
      h.lower.includes(s) ||
      h.judgment.includes(s),
  );
}
