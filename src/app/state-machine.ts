import { castHexagram, tossThreeCoins, linesToHexagram, type CastingResult, type LineResult, type Rng, cryptoRng } from '../divination';

export type Phase =
  | 'idle'
  | 'loadingCoins'
  | 'ready'
  | 'shaking'
  | 'revealing'
  | 'lineDone'
  | 'complete';

export interface RitualState {
  phase: Phase;
  matter: string;
  category?: string;
  lineIndex: number;
  lines: LineResult[];
  casting?: CastingResult;
  muted: boolean;
}

export type RitualEvent =
  | { type: 'SET_MATTER'; matter: string; category?: string }
  | { type: 'START_LOAD' }
  | { type: 'LOAD_DONE' }
  | { type: 'SHAKE' }
  | { type: 'SHAKE_DONE'; line: LineResult }
  | { type: 'LINE_ACK' }
  | { type: 'RESET' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CASTING'; casting: CastingResult };

export function initialState(): RitualState {
  return {
    phase: 'idle',
    matter: '',
    lineIndex: 0,
    lines: [],
    muted: false,
  };
}

export function reduce(state: RitualState, event: RitualEvent): RitualState {
  switch (event.type) {
    case 'SET_MATTER':
      return { ...state, matter: event.matter, category: event.category };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    case 'RESET':
      return { ...initialState(), muted: state.muted, matter: state.matter, category: state.category };
    case 'START_LOAD':
      if (state.phase !== 'idle' && state.phase !== 'complete') return state;
      return { ...state, phase: 'loadingCoins', lineIndex: 0, lines: [], casting: undefined };
    case 'LOAD_DONE':
      if (state.phase !== 'loadingCoins') return state;
      return { ...state, phase: 'ready' };
    case 'SHAKE':
      if (state.phase !== 'ready' && state.phase !== 'lineDone') return state;
      if (state.lineIndex >= 6) return state;
      return { ...state, phase: 'shaking' };
    case 'SHAKE_DONE': {
      if (state.phase !== 'shaking') return state;
      const lines = [...state.lines, event.line];
      return { ...state, phase: 'revealing', lines };
    }
    case 'LINE_ACK': {
      if (state.phase !== 'revealing') return state;
      const next = state.lineIndex + 1;
      if (next >= 6) {
        const casting = linesToHexagram(state.lines);
        return { ...state, phase: 'complete', lineIndex: next, casting };
      }
      return { ...state, phase: 'lineDone', lineIndex: next };
    }
    case 'SET_CASTING':
      return {
        ...state,
        phase: 'complete',
        casting: event.casting,
        lines: event.casting.lines,
        lineIndex: 6,
      };
    default:
      return state;
  }
}

/** 预掷当前爻（动画贴合结果） */
export function previewNextLine(_state: RitualState, rng: Rng = cryptoRng): LineResult {
  return tossThreeCoins(rng);
}

export function fullCast(rng: Rng = cryptoRng): CastingResult {
  return castHexagram(rng);
}
