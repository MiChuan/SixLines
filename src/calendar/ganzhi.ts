const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type WuXing = '木' | '火' | '土' | '金' | '水';

export interface Pillars {
  year: string;
  month: string;
  day: string;
  dayStem: (typeof STEMS)[number];
  dayBranch: (typeof BRANCHES)[number];
  dayElement: WuXing;
}

const STEM_ELEMENT: Record<(typeof STEMS)[number], WuXing> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const BRANCH_ELEMENT: Record<(typeof BRANCHES)[number], WuXing> = {
  寅: '木', 卯: '木', 巳: '火', 午: '火', 辰: '土', 戌: '土', 丑: '土', 未: '土',
  申: '金', 酉: '金', 亥: '水', 子: '水',
};

function pillar(stemIdx: number, branchIdx: number): string {
  return `${STEMS[((stemIdx % 10) + 10) % 10]}${BRANCHES[((branchIdx % 12) + 12) % 12]}`;
}

/** 以公历年近似年柱（甲子=1984）；立春前仍属上一年的精细校正从略，作文化体验用 */
export function getYearPillar(date: Date): string {
  let y = date.getFullYear();
  // 约立春：2月4日
  if (date.getMonth() < 1 || (date.getMonth() === 1 && date.getDate() < 4)) y -= 1;
  const offset = y - 1984;
  return pillar(offset, offset);
}

/** 月柱：以节令近似（寅月≈立春起） */
export function getMonthPillar(date: Date): string {
  const yearStem = STEMS.indexOf(getYearPillar(date)[0] as (typeof STEMS)[number]);
  // 寅月索引 0 … 丑月 11；公历月粗映射：立春后正月=寅
  const m = date.getMonth(); // 0-11
  const d = date.getDate();
  // 简化节气分界日
  const boundaries = [6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7];
  let monthIndex = m - 1; // Jan→丑月(-1→11), Feb→寅…
  if (d < boundaries[m]!) monthIndex -= 1;
  monthIndex = ((monthIndex % 12) + 12) % 12;
  // 甲己之年丙作首
  const monthStemBase = [2, 4, 6, 8, 0][yearStem % 5]!;
  return pillar(monthStemBase + monthIndex, monthIndex + 2); // 寅=2
}

/** 日柱：1900-01-01 = 甲戌 */
export function getDayPillar(date: Date): { text: string; stem: (typeof STEMS)[number]; branch: (typeof BRANCHES)[number] } {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = Date.UTC(1900, 0, 1);
  const diff = Math.round((utc - epoch) / 86400000);
  const stemIdx = ((diff % 10) + 10) % 10; // 甲
  const branchIdx = ((diff + 10) % 12 + 12) % 12; // 戌=10
  return {
    text: pillar(stemIdx, branchIdx),
    stem: STEMS[stemIdx]!,
    branch: BRANCHES[branchIdx]!,
  };
}

export function getDayPillars(date: Date = new Date()): Pillars {
  const day = getDayPillar(date);
  return {
    year: getYearPillar(date),
    month: getMonthPillar(date),
    day: day.text,
    dayStem: day.stem,
    dayBranch: day.branch,
    dayElement: STEM_ELEMENT[day.stem],
  };
}

export function elementOfBranch(b: (typeof BRANCHES)[number]): WuXing {
  return BRANCH_ELEMENT[b];
}

/** 生：木→火→土→金→水→木；克：木→土→水→火→金→木 */
export function relation(a: WuXing, b: WuXing): '同' | '生' | '被生' | '克' | '被克' {
  if (a === b) return '同';
  const sheng: Record<WuXing, WuXing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const ke: Record<WuXing, WuXing> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (sheng[a] === b) return '生';
  if (sheng[b] === a) return '被生';
  if (ke[a] === b) return '克';
  return '被克';
}
