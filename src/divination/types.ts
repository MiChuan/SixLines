/** 三钱：字(阳)=true=3，背(阴)=false=2 */

export type LineValue = 6 | 7 | 8 | 9;

export interface LineResult {
  value: LineValue;
  /** 成卦阴阳（老阴变阳前记阴，老阳变阴前记阳） */
  yinYang: 'yin' | 'yang';
  changing: boolean;
  /** 三枚是否字面朝上（阳） */
  coins: [boolean, boolean, boolean];
}

export interface CastingResult {
  lines: LineResult[];
  /** 文王序 1–64 */
  primary: number;
  /** 有动爻时的变卦 */
  changed?: number;
  changingIndexes: number[];
}
