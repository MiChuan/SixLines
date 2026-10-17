import { el } from './dom';
import { getDayPillars } from '../calendar/ganzhi';
import { getHexagram, searchHexagrams, type Hexagram } from '../data/hexagrams';
import { lineSymbol, type CastingResult } from '../divination';
import { judgeMatter, type MatterCategory, type JudgmentResult } from '../judgment/verdict';
import { CastStage } from './cast-stage';
import type { LineResult } from '../divination';

const CATEGORIES: MatterCategory[] = ['功名', '求财', '出行', '婚恋', '健康', '诉讼', '其他'];

export interface UiHandlers {
  onShakeShell: () => void;
  onReset: () => void;
  onMute: () => void;
  onMatterChange: (matter: string, category?: MatterCategory) => void;
  onOpenAtlas: () => void;
}

export class AppUI {
  root: HTMLElement;
  stage!: CastStage;
  private resultsEl!: HTMLElement;
  private atlasEl!: HTMLElement;
  private matterInput!: HTMLInputElement;
  private category: MatterCategory | undefined;
  private muteBtn!: HTMLButtonElement;

  constructor(
    mount: HTMLElement,
    private handlers: UiHandlers,
  ) {
    this.root = mount;
    this.buildShell();
  }

  private buildShell(): void {
    const pillars = getDayPillars();
    const top = el('div', { class: 'top-bar' }, [
      el('div', {}, [
        el('h1', { class: 'brand', text: '六爻' }),
        el('p', { class: 'brand-sub', text: '龟壳摇卦 · 开元通宝' }),
      ]),
      el('div', {}, [
        el('div', { class: 'pillars' }, [
          `岁次 ${pillars.year}　月建 ${pillars.month}　日辰 ${pillars.day}`,
        ]),
        el('div', { class: 'toolbar' }, [
          (this.muteBtn = el('button', { class: 'btn', type: 'button', text: '音效' }) as HTMLButtonElement),
          el('button', { class: 'btn', type: 'button', text: '六十四卦', id: 'btn-atlas' }),
          el('button', { class: 'btn', type: 'button', text: '再占', id: 'btn-reset' }),
        ]),
      ]),
    ]);

    const ask = el('div', { class: 'ask-bar' }, [
      (this.matterInput = el('input', {
        type: 'text',
        placeholder: '默念或书所问之事，例：此行求财可否',
        maxlength: '40',
        class: 'matter-input',
      }) as HTMLInputElement),
      el('div', { class: 'categories', id: 'cats' }),
    ]);

    const cats = ask.querySelector('#cats')!;
    for (const c of CATEGORIES) {
      const chip = el('button', { class: 'chip', type: 'button', text: c });
      chip.addEventListener('click', () => {
        this.category = c;
        cats.querySelectorAll('.chip').forEach((n) => n.classList.remove('active'));
        chip.classList.add('active');
        this.emitMatter();
      });
      cats.append(chip);
    }

    this.stage = new CastStage(() => this.handlers.onShakeShell());

    const guide = el('div', { class: 'liucheng' }, [
      el('div', { class: 'buzhou', text: '六爻占卜流程：' }),
      el('p', {
        text: '1、占卜之前默念所测之事，点击龟壳开始摇卦；',
      }),
      el('p', {
        text: '2、铜钱为开元通宝：汉字一面为阳，光背一面为阴；',
      }),
      el('p', {
        text: '3、每点击一次求得一爻，共六次成卦；成卦区自下而上为初爻至上爻。',
      }),
    ]);

    const footer = el('div', { class: 'footer' }, [
      el('span', {
        text: '本站为《周易》文化体验，卜辞与干支断语仅供赏玩，不作决策依据。',
      }),
    ]);

    const page = el('div', { class: 'page' }, [top, ask, this.stage.root, guide, footer]);
    this.root.append(page);

    this.resultsEl = el('div', { class: 'results' });
    this.atlasEl = el('div', { class: 'atlas' });
    this.root.append(this.resultsEl, this.atlasEl);

    this.matterInput.addEventListener('input', () => this.emitMatter());
    this.muteBtn.addEventListener('click', () => this.handlers.onMute());
    this.root.querySelector('#btn-reset')!.addEventListener('click', () => this.handlers.onReset());
    this.root.querySelector('#btn-atlas')!.addEventListener('click', () => this.handlers.onOpenAtlas());
  }

  private emitMatter(): void {
    this.handlers.onMatterChange(this.matterInput.value.trim(), this.category);
  }

  setMuted(muted: boolean): void {
    this.muteBtn.textContent = muted ? '音效 · 静' : '音效';
  }

  updateCast(lines: LineResult[], nextIndex: number, done: boolean): void {
    this.stage.updateLines(lines);
    this.stage.setTip(Math.min(nextIndex + 1, 6), done);
  }

  showResults(casting: CastingResult, matter: string, category?: MatterCategory): void {
    const primary = getHexagram(casting.primary);
    const changed = casting.changed ? getHexagram(casting.changed) : undefined;
    const judged = judgeMatter({
      matter,
      category,
      hexagramNature: primary.nature,
    });

    const inner = el('div', { class: 'panel-inner' });
    const closeBtn = el('button', { class: 'btn', type: 'button', text: '闭合' });
    closeBtn.addEventListener('click', () => this.resultsEl.classList.remove('open'));
    inner.append(
      closeBtn,
      el('h2', { text: `本卦 · ${primary.name}` }),
      el('p', { text: `第 ${primary.id} 卦　${primary.lower}下${primary.upper}上` }),
    );
    if (matter) inner.append(el('p', { text: `所问：${matter}`, style: 'opacity:0.8' }));

    if ('needCategory' in judged) {
      inner.append(el('p', { text: `今日${judged.pillars.day}。请点选用事类别，以便干支断语。` }));
    } else {
      const j = judged as JudgmentResult;
      inner.append(
        el('div', { class: `verdict ${j.verdict}`, text: j.verdict }),
        el('p', { text: j.text }),
      );
    }

    inner.append(this.oracleBlock('卦辞', primary.judgment));
    if (casting.changingIndexes.length) {
      inner.append(
        this.oracleBlock(
          '动爻',
          casting.changingIndexes.map((i) => `第${i + 1}爻（动）：${primary.lines[i]}`).join('\n'),
        ),
      );
    }
    inner.append(this.oracleBlock('象曰', primary.interpretation));
    if (changed) {
      inner.append(
        el('h2', { text: `变卦 · ${changed.name}`, style: 'margin-top:1.5rem' }),
        this.oracleBlock('变卦辞', changed.judgment),
        this.oracleBlock('变象', changed.interpretation),
      );
    }
    const linesBox = el('div', { class: 'oracle-block' }, [el('h3', { text: '六爻' })]);
    casting.lines.forEach((l, i) => {
      linesBox.append(el('div', { text: `${i + 1} ${lineSymbol(l)}　${primary.lines[i] ?? ''}` }));
    });
    inner.append(linesBox);
    inner.append(
      el('p', {
        style: 'opacity:0.5;font-size:0.8rem;margin-top:2rem',
        text: '文化体验 · 非决策依据',
      }),
    );

    this.resultsEl.innerHTML = '';
    this.resultsEl.append(inner);
    this.resultsEl.classList.add('open');
  }

  private oracleBlock(title: string, body: string): HTMLElement {
    return el('div', { class: 'oracle-block' }, [el('h3', { text: title }), el('div', { text: body })]);
  }

  openAtlas(onPick?: (h: Hexagram) => void): void {
    const inner = el('div', { class: 'panel-inner' });
    const search = el('input', {
      type: 'text',
      placeholder: '检索卦名或序号',
      class: 'atlas-search',
    }) as HTMLInputElement;
    const grid = el('div', { class: 'atlas-grid' });
    const render = (q = '') => {
      grid.innerHTML = '';
      for (const h of searchHexagrams(q)) {
        const item = el('button', { class: 'atlas-item', type: 'button' }, [
          el('span', { class: 'num', text: String(h.id) }),
          h.name,
        ]);
        item.addEventListener('click', () => this.showHexDetail(h, onPick));
        grid.append(item);
      }
    };
    render();
    search.addEventListener('input', () => render(search.value));
    const closeBtn = el('button', { class: 'btn', type: 'button', text: '闭合' });
    closeBtn.addEventListener('click', () => this.atlasEl.classList.remove('open'));
    inner.append(closeBtn, el('h2', { text: '六十四卦' }), search, grid);
    this.atlasEl.innerHTML = '';
    this.atlasEl.append(inner);
    this.atlasEl.classList.add('open');
  }

  private showHexDetail(h: Hexagram, onPick?: (h: Hexagram) => void): void {
    const inner = el('div', { class: 'panel-inner' });
    const back = el('button', { class: 'btn', type: 'button', text: '返回目录' });
    back.addEventListener('click', () => this.openAtlas(onPick));
    inner.append(
      back,
      el('h2', { text: `${h.id}. ${h.name}` }),
      el('p', { text: `${h.lower}下${h.upper}上` }),
      this.oracleBlock('卦辞', h.judgment),
      this.oracleBlock('象曰', h.interpretation),
    );
    h.lines.forEach((line, i) => {
      inner.append(el('div', { class: 'oracle-block' }, [el('div', { text: `爻${i + 1}：${line}` })]));
    });
    if (onPick) {
      const demo = el('button', { class: 'btn btn-primary', type: 'button', text: '以此卦演示' });
      demo.addEventListener('click', () => {
        this.atlasEl.classList.remove('open');
        onPick(h);
      });
      inner.append(demo);
    }
    this.atlasEl.innerHTML = '';
    this.atlasEl.append(inner);
  }

  closePanels(): void {
    this.resultsEl.classList.remove('open');
    this.atlasEl.classList.remove('open');
  }
}
