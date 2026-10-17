import { el } from './dom';
import type { LineResult } from '../divination';

const LINE_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'] as const;

function lineName(line: LineResult): string {
  if (line.value === 6) return '老阴';
  if (line.value === 7) return '少阳';
  if (line.value === 8) return '少阴';
  return '老阳';
}

function lineBars(line: LineResult): string {
  // SVG bars matching classic fortune sites
  if (line.yinYang === 'yang') {
    return `<svg class="yao-bars" viewBox="0 0 80 12" aria-hidden="true"><rect x="0" y="3" width="80" height="6" rx="1" fill="${line.changing ? '#c45c26' : '#5c3a1e'}"/></svg>`;
  }
  return `<svg class="yao-bars" viewBox="0 0 80 12" aria-hidden="true"><rect x="0" y="3" width="34" height="6" rx="1" fill="${line.changing ? '#c45c26' : '#5c3a1e'}"/><rect x="46" y="3" width="34" height="6" rx="1" fill="${line.changing ? '#c45c26' : '#5c3a1e'}"/></svg>`;
}

/** 自绘俯视龟甲 SVG（仿经典龟壳摇卦站构图，非站外素材） */
function shellSvg(): string {
  return `
<svg class="shell-art" viewBox="0 0 320 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="龟甲">
  <defs>
    <radialGradient id="shellBody" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#c4a574"/>
      <stop offset="45%" stop-color="#8b6914"/>
      <stop offset="100%" stop-color="#3d2914"/>
    </radialGradient>
    <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4b896"/>
      <stop offset="100%" stop-color="#6b4a28"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- 甲体外轮廓 -->
  <ellipse cx="160" cy="190" rx="132" ry="150" fill="url(#shellBody)" filter="url(#soft)" stroke="#2a1a0c" stroke-width="3"/>
  <!-- 外缘盾 -->
  ${Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const x = 160 + Math.cos(a) * 118;
    const y = 190 + Math.sin(a) * 136;
    return `<ellipse cx="${x}" cy="${y}" rx="18" ry="14" fill="#9a7340" stroke="#3d2914" stroke-width="1.5" transform="rotate(${(a * 180) / Math.PI} ${x} ${y})"/>`;
  }).join('')}
  <!-- 中脊盾片 -->
  <polygon points="160,78 188,108 176,148 144,148 132,108" fill="url(#plateGrad)" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="144,148 176,148 182,188 160,210 138,188" fill="url(#plateGrad)" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="138,188 160,210 182,188 176,236 144,236" fill="url(#plateGrad)" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="144,236 176,236 168,278 152,278" fill="url(#plateGrad)" stroke="#2a1a0c" stroke-width="2"/>
  <!-- 左右肋板 -->
  <polygon points="132,108 144,148 118,168 92,128" fill="#a67c42" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="188,108 176,148 202,168 228,128" fill="#a67c42" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="118,168 144,148 138,188 108,205 95,175" fill="#b08950" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="202,168 176,148 182,188 212,205 225,175" fill="#b08950" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="108,205 138,188 144,236 112,248 98,220" fill="#a67c42" stroke="#2a1a0c" stroke-width="2"/>
  <polygon points="212,205 182,188 176,236 208,248 222,220" fill="#a67c42" stroke="#2a1a0c" stroke-width="2"/>
  <!-- 中央凹窝（放币） -->
  <ellipse cx="160" cy="175" rx="48" ry="36" fill="#2a1a0c" opacity="0.55"/>
  <ellipse cx="160" cy="172" rx="40" ry="28" fill="#1a1008" stroke="#c9a227" stroke-width="2"/>
  <!-- 头 -->
  <ellipse cx="160" cy="48" rx="28" ry="22" fill="#8a6a4a" stroke="#3d2914" stroke-width="2"/>
  <ellipse cx="148" cy="44" rx="4" ry="3" fill="#1a1008"/>
  <ellipse cx="172" cy="44" rx="4" ry="3" fill="#1a1008"/>
  <!-- 尾 -->
  <ellipse cx="160" cy="338" rx="16" ry="12" fill="#8a6a4a" stroke="#3d2914" stroke-width="2"/>
  <!-- 脚 stub -->
  <ellipse cx="48" cy="140" rx="22" ry="16" fill="#7a5a3a" stroke="#3d2914" stroke-width="2"/>
  <ellipse cx="272" cy="140" rx="22" ry="16" fill="#7a5a3a" stroke="#3d2914" stroke-width="2"/>
  <ellipse cx="52" cy="250" rx="20" ry="15" fill="#7a5a3a" stroke="#3d2914" stroke-width="2"/>
  <ellipse cx="268" cy="250" rx="20" ry="15" fill="#7a5a3a" stroke="#3d2914" stroke-width="2"/>
</svg>`;
}

function coinSvg(yang: boolean, cls: string): string {
  if (yang) {
    return `<div class="coin ${cls} yang" aria-hidden="true">
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#c4a35a" stroke="#5c4030" stroke-width="2"/>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#8b6914" stroke-width="1.5"/>
      <rect x="26" y="26" width="12" height="12" fill="#3d2914"/>
      <text x="32" y="18" text-anchor="middle" font-size="9" fill="#3d2914" font-family="serif">开</text>
      <text x="48" y="36" text-anchor="middle" font-size="9" fill="#3d2914" font-family="serif">元</text>
      <text x="32" y="54" text-anchor="middle" font-size="9" fill="#3d2914" font-family="serif">通</text>
      <text x="16" y="36" text-anchor="middle" font-size="9" fill="#3d2914" font-family="serif">宝</text>
      </svg></div>`;
  }
  return `<div class="coin ${cls} yin" aria-hidden="true">
    <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#a08050" stroke="#5c4030" stroke-width="2"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#6b5344" stroke-width="1"/>
    <rect x="26" y="26" width="12" height="12" fill="#3d2914"/>
    <path d="M18 22 Q32 12 46 22" fill="none" stroke="#6b5344" stroke-width="1.2"/>
    </svg></div>`;
}

export class CastStage {
  root: HTMLElement;
  private tipEl!: HTMLElement;
  private remainEl!: HTMLElement;
  private dongtu!: HTMLElement;
  private coinBox!: HTMLElement;
  private listEl!: HTMLElement;
  private shaking = false;

  constructor(private onShake: () => void) {
    this.root = el('div', { class: 'cast-stage' });
    this.build();
  }

  private build(): void {
    this.tipEl = el('div', { class: 'yao-tishi', text: '默念所问之事，点击龟壳开始第 1 次摇卦' });

    this.dongtu = el('div', { class: 'dongtu', role: 'button', tabindex: '0', title: '点击龟壳摇卦' });
    this.dongtu.innerHTML = shellSvg();
    this.coinBox = el('div', { class: 'yigbi' });
    this.coinBox.innerHTML =
      coinSvg(true, 'ying1') + coinSvg(false, 'ying2') + coinSvg(true, 'ying3');
    this.dongtu.append(this.coinBox);

    this.listEl = el('div', { class: 'yao-list' });
    // 自上而下显示：上爻…初爻（与 k366 一致）；数据仍自下而上累积
    for (let i = 5; i >= 0; i--) {
      const row = el('div', {
        class: 'yao-item hide',
        'data-i': String(i),
      });
      row.innerHTML = `<span class="yao-pos">${LINE_LABELS[i]}：</span><span class="yao-name">—</span><span class="yao-symbol"></span>`;
      this.listEl.append(row);
    }
    this.remainEl = el('div', { class: 'shengyu', text: '还剩 6 次' });
    this.listEl.append(this.remainEl);

    const box = el('div', { class: 'liuyao-box' }, [
      this.tipEl,
      el('div', { class: 'cast-row' }, [this.dongtu, this.listEl]),
    ]);
    this.root.append(box);

    this.dongtu.addEventListener('click', () => this.handleClick());
    this.dongtu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick();
      }
    });
  }

  private handleClick(): void {
    if (this.shaking) return;
    this.onShake();
  }

  setBusy(v: boolean): void {
    this.shaking = v;
    this.dongtu.classList.toggle('busy', v);
  }

  /** 播放摇晃 + 露出三钱正反 */
  async playShake(faces: [boolean, boolean, boolean]): Promise<void> {
    this.setBusy(true);
    this.dongtu.classList.add('yaohuan');
    this.coinBox.classList.remove('show', 'pop');
    await wait(850);
    this.dongtu.classList.remove('yaohuan');
    this.coinBox.innerHTML =
      coinSvg(faces[0]!, 'ying1') +
      coinSvg(faces[1]!, 'ying2') +
      coinSvg(faces[2]!, 'ying3');
    this.coinBox.classList.add('show', 'pop');
    await wait(650);
    this.setBusy(false);
  }

  updateLines(lines: LineResult[]): void {
    const rows = this.listEl.querySelectorAll('.yao-item');
    rows.forEach((row) => {
      const i = Number((row as HTMLElement).dataset.i);
      const line = lines[i];
      if (!line) {
        row.classList.add('hide');
        return;
      }
      row.classList.remove('hide');
      row.querySelector('.yao-name')!.textContent = lineName(line);
      row.querySelector('.yao-symbol')!.innerHTML = lineBars(line);
    });
    const left = Math.max(0, 6 - lines.length);
    this.remainEl.textContent = left > 0 ? `还剩 ${left} 次` : '摇卦结束';
    this.remainEl.classList.toggle('done', left === 0);
  }

  setTip(n: number, done = false): void {
    this.tipEl.textContent = done
      ? '摇卦结束'
      : `默念所问之事，点击龟壳开始第 ${n} 次摇卦`;
  }

  reset(): void {
    this.updateLines([]);
    this.setTip(1);
    this.coinBox.classList.remove('show', 'pop');
    this.setBusy(false);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
