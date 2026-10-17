import { getDayPillars, relation, type Pillars, type WuXing } from '../calendar/ganzhi';

export type MatterCategory = '功名' | '求财' | '出行' | '婚恋' | '健康' | '诉讼' | '其他';
export type VerdictLevel = '宜' | '慎' | '忌';

export interface JudgmentInput {
  matter: string;
  category?: MatterCategory;
  hexagramNature: 'auspicious' | 'neutral' | 'inauspicious';
  date?: Date;
}

export interface JudgmentResult {
  verdict: VerdictLevel;
  text: string;
  pillars: Pillars;
  matterElement: WuXing;
  category: MatterCategory;
}

const CATEGORY_ELEMENT: Record<MatterCategory, WuXing> = {
  功名: '火',
  求财: '金',
  出行: '木',
  婚恋: '水',
  健康: '土',
  诉讼: '金',
  其他: '土',
};

const KEYWORDS: [RegExp, MatterCategory][] = [
  [/考|试|升|官|名|学|职|仕/, '功名'],
  [/财|钱|利|商|贾|投|赚|金/, '求财'],
  [/行|旅|出|路|迁|徙|游/, '出行'],
  [/婚|恋|姻|情|嫁|娶|配/, '婚恋'],
  [/病|疾|康|身|医|疗/, '健康'],
  [/讼|诉|官非|争|狱/, '诉讼'],
];

export function inferCategory(matter: string, fallback?: MatterCategory): MatterCategory | null {
  for (const [re, cat] of KEYWORDS) {
    if (re.test(matter)) return cat;
  }
  return fallback ?? null;
}

export function inferMatterElement(matter: string, category?: MatterCategory): { element: WuXing; category: MatterCategory } | null {
  const cat = inferCategory(matter, category);
  if (!cat) return null;
  return { element: CATEGORY_ELEMENT[cat], category: cat };
}

export function judgeMatter(input: JudgmentInput): JudgmentResult | { needCategory: true; pillars: Pillars } {
  const pillars = getDayPillars(input.date ?? new Date());
  const inferred = inferMatterElement(input.matter, input.category);
  if (!inferred) {
    return { needCategory: true, pillars };
  }

  const rel = relation(pillars.dayElement, inferred.element);
  let verdict: VerdictLevel = '慎';
  // 日干五行对用事：生之或同气偏宜；克之偏忌；被克/被生偏慎
  if (rel === '生' || rel === '同') verdict = '宜';
  else if (rel === '克') verdict = '忌';
  else verdict = '慎';

  // 卦象微调
  if (input.hexagramNature === 'auspicious' && verdict === '慎') verdict = '宜';
  if (input.hexagramNature === 'inauspicious' && verdict === '宜') verdict = '慎';
  if (input.hexagramNature === 'inauspicious' && verdict === '慎') verdict = '忌';

  const relPhrase: Record<typeof rel, string> = {
    同: '气类相合',
    生: '日气生事',
    被生: '事气生日',
    克: '日气克事',
    被克: '事气克日',
  };

  const text =
    `日值${pillars.day}，天干属${pillars.dayElement}，用事属${inferred.element}，` +
    `${relPhrase[rel]}，卦象${natureWord(input.hexagramNature)}，故${verdict}` +
    `${ending(verdict)}`;

  return {
    verdict,
    text,
    pillars,
    matterElement: inferred.element,
    category: inferred.category,
  };
}

function natureWord(n: JudgmentInput['hexagramNature']): string {
  if (n === 'auspicious') return '偏吉';
  if (n === 'inauspicious') return '偏咎';
  return '中平';
}

function ending(v: VerdictLevel): string {
  if (v === '宜') return '。可顺势图之。';
  if (v === '忌') return '。宜缓图之，勿强为。';
  return '。当慎始敬终，量力而行。';
}
