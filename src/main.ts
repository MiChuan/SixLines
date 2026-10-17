import './styles/main.css';
import { AppUI } from './ui/app-ui';
import { RitualAudio } from './audio/synth';
import { RitualScene } from './scene/RitualScene';
import { initialState, reduce, previewNextLine, type RitualState } from './app/state-machine';
import { lineSymbol, type LineResult } from './divination';
import { sumToLine } from './divination/coins';
import { BIN2WEN, linesToHexagram } from './divination/hexagram';
import type { MatterCategory } from './judgment/verdict';
import { getHexagram } from './data/hexagrams';

const app = document.querySelector<HTMLElement>('#app')!;
const canvasHost = document.createElement('div');
canvasHost.id = 'canvas-host';
app.append(canvasHost);

const grain = document.createElement('div');
grain.className = 'bg-grain';
app.append(grain);

const fallback = document.createElement('div');
fallback.className = 'fallback';
fallback.textContent = '龜';
app.append(fallback);

const audio = new RitualAudio();
let state: RitualState = initialState();
let scene: RitualScene | null = null;
let busy = false;
let pendingLine: LineResult | null = null;

function webglOk(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

if (webglOk()) {
  scene = new RitualScene(canvasHost, audio);
} else {
  fallback.classList.add('show');
}

function binaryFlagsForHexagram(id: number): boolean[] {
  const bits = BIN2WEN.indexOf(id);
  if (bits < 0) return [true, true, true, true, true, true];
  return [0, 1, 2, 3, 4, 5].map((i) => Boolean((bits >> i) & 1));
}

const ui = new AppUI(app, {
  onStart: () => void startRitual(),
  onShake: () => void shakeOnce(),
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
        return {
          ...sumToLine(value),
          coins: yang ? [true, true, false] : [false, false, true],
        };
      });
      const casting = linesToHexagram(lines);
      state = reduce(state, { type: 'SET_CASTING', casting });
      syncLines();
      ui.setStatus(`演示 · ${h.name}`);
      ui.showResults(
        casting,
        state.matter || `观${h.name}卦`,
        state.category as MatterCategory | undefined,
      );
      syncControls();
    });
  },
});

function syncLines(): void {
  ui.renderLines(
    state.lines.map((l) => ({ symbol: lineSymbol(l), changing: l.changing })),
    state.lines.length,
  );
}

function syncControls(): void {
  const ritualActive = ['loadingCoins', 'ready', 'shaking', 'revealing', 'lineDone'].includes(
    state.phase,
  );
  ui.setControls({
    canStart: state.phase === 'idle' || state.phase === 'complete',
    canShake: (state.phase === 'ready' || state.phase === 'lineDone') && !busy,
    askVisible: !ritualActive || state.phase === 'complete',
  });
}

async function startRitual(): Promise<void> {
  if (busy) return;
  audio.unlock();
  busy = true;
  ui.closePanels();
  state = reduce(state, { type: 'START_LOAD' });
  ui.setStatus('通宝入甲…');
  syncControls();
  try {
    if (scene) await scene.playLoadCoins();
    else await wait(800);
    state = reduce(state, { type: 'LOAD_DONE' });
    ui.setStatus(`第 ${state.lineIndex + 1} 爻 · 请摇`);
  } finally {
    busy = false;
    syncControls();
  }
}

async function shakeOnce(): Promise<void> {
  if (busy) return;
  if (state.phase !== 'ready' && state.phase !== 'lineDone') return;
  audio.unlock();
  busy = true;
  pendingLine = previewNextLine(state);
  state = reduce(state, { type: 'SHAKE' });
  ui.setStatus(`摇第 ${state.lineIndex + 1} 爻…`);
  syncControls();
  try {
    if (scene) await scene.playShakeAndToss(pendingLine.coins);
    else await wait(1000);
    state = reduce(state, { type: 'SHAKE_DONE', line: pendingLine });
    syncLines();
    ui.setStatus(`第 ${state.lines.length} 爻得 ${lineSymbol(pendingLine)}`);
    await wait(600);
    state = reduce(state, { type: 'LINE_ACK' });
    if (state.phase === 'complete' && state.casting) {
      if (scene) {
        await scene.playFinale();
        scene.hideCoins();
      }
      ui.setStatus(`成卦 · ${getHexagram(state.casting.primary).name}`);
      ui.showResults(
        state.casting,
        state.matter,
        state.category as MatterCategory | undefined,
      );
    } else if (scene) {
      await scene.playRecall();
      ui.setStatus(`第 ${state.lineIndex + 1} 爻 · 请摇`);
    } else {
      ui.setStatus(`第 ${state.lineIndex + 1} 爻 · 请摇`);
    }
  } finally {
    busy = false;
    pendingLine = null;
    syncControls();
  }
}

function resetRitual(): void {
  if (busy) return;
  state = reduce(state, { type: 'RESET' });
  scene?.hideCoins();
  ui.closePanels();
  ui.setStatus('静候启卦');
  syncLines();
  syncControls();
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

syncControls();
ui.setMuted(false);
