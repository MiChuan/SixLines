import './styles/main.css';
import { AppUI } from './ui/app-ui';
import { RitualAudio } from './audio/synth';
import { initialState, reduce, previewNextLine, type RitualState } from './app/state-machine';
import { linesToHexagram, BIN2WEN } from './divination/hexagram';
import { sumToLine } from './divination/coins';
import type { LineResult } from './divination';
import type { MatterCategory } from './judgment/verdict';
import { getHexagram } from './data/hexagrams';

const app = document.querySelector<HTMLElement>('#app')!;
const audio = new RitualAudio();

let state: RitualState = initialState();
let busy = false;

function binaryFlagsForHexagram(id: number): boolean[] {
  const bits = BIN2WEN.indexOf(id);
  if (bits < 0) return [true, true, true, true, true, true];
  return [0, 1, 2, 3, 4, 5].map((i) => Boolean((bits >> i) & 1));
}

const ui = new AppUI(app, {
  onShakeShell: () => void shakeOnce(),
  onReset: () => resetRitual(),
  onMute: () => {
    state = reduce(state, { type: 'TOGGLE_MUTE' });
    audio.muted = state.muted;
    ui.setMuted(state.muted);
  },
  onMatterChange: (matter, category) => {
    state = reduce(state, { type: 'SET_MATTER', matter, category });
  },
  onOpenAtlas: () => {
    ui.openAtlas((h) => {
      const lines: LineResult[] = binaryFlagsForHexagram(h.id).map((yang) => {
        const value = yang ? 7 : 8;
        return { ...sumToLine(value), coins: yang ? [true, true, false] : [false, false, true] };
      });
      const casting = linesToHexagram(lines);
      state = reduce(state, { type: 'SET_CASTING', casting });
      ui.updateCast(state.lines, 6, true);
      ui.showResults(
        casting,
        state.matter || `观${h.name}卦`,
        state.category as MatterCategory | undefined,
      );
    });
  },
});

async function shakeOnce(): Promise<void> {
  if (busy) return;
  if (state.phase === 'complete') return;

  // 首次点击：进入仪式（无需单独装币）
  if (state.phase === 'idle') {
    state = reduce(state, { type: 'START_LOAD' });
    state = reduce(state, { type: 'LOAD_DONE' });
  }
  if (state.phase !== 'ready' && state.phase !== 'lineDone') return;

  audio.unlock();
  busy = true;
  const pending = previewNextLine(state);
  state = reduce(state, { type: 'SHAKE' });

  try {
    audio.playShake();
    await ui.stage.playShake(pending.coins);
    pending.coins.forEach((_, i) => audio.playLand(i));

    state = reduce(state, { type: 'SHAKE_DONE', line: pending });
    state = reduce(state, { type: 'LINE_ACK' });
    ui.updateCast(state.lines, state.lineIndex, state.phase === 'complete');

    if (state.phase === 'complete' && state.casting) {
      audio.playBell();
      ui.showResults(
        state.casting,
        state.matter,
        state.category as MatterCategory | undefined,
      );
      void getHexagram(state.casting.primary);
    }
  } finally {
    busy = false;
  }
}

function resetRitual(): void {
  if (busy) return;
  state = reduce(state, { type: 'RESET' });
  ui.closePanels();
  ui.stage.reset();
  ui.updateCast([], 0, false);
}

ui.setMuted(false);
ui.updateCast([], 0, false);
