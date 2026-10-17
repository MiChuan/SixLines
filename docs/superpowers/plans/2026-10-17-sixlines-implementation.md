# SixLines Ritual Theater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Vite+Three.js GitHub Pages SPA for turtle-shell three-coin I Ching divination with audio, 64-hexagram atlas, gan-zhi judgment, and a portable agent skill.

**Architecture:** Pure client SPA. Ritual state machine drives Three.js scene animations and DOM UI. Pure modules (`divination`, `calendar`, `judgment`) are unit-tested without WebGL. Static `dist/` deploys via GitHub Actions Pages.

**Tech Stack:** Vite 6, TypeScript, Three.js r170+, Vitest, GitHub Actions `deploy-pages`, Web Audio API.

## Global Constraints

- Visual: ink-gold ancient scroll (deep ink, gilt accents); no purple/cream AI-default looks
- Coin method: 字=3 背=2; sums 6/7/8/9 = 老阴/少阳/少阴/老阳; bottom-up six lines
- Judgment: classical Chinese 宜/慎/忌 only
- Models: procedural only; audio: Web Audio synthesis
- Deploy base: `/SixLines/` on Pages, `/` locally
- Disclaimer footer required

## File Map

| Path | Responsibility |
|------|----------------|
| `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` | Scaffold + Pages base |
| `.github/workflows/deploy.yml` | Build + Pages deploy |
| `src/divination/*` | Coins → lines → hexagrams |
| `src/calendar/*` | Date → stems/branches |
| `src/judgment/*` | Matter + day → verdict |
| `src/data/hexagrams.json` | 64 hexagram texts |
| `src/app/state-machine.ts` | Ritual phases |
| `src/scene/*` | Three.js shell, coins, timeline |
| `src/audio/synth.ts` | Procedural SFX |
| `src/ui/*` | DOM overlay, atlas, results |
| `src/styles/main.css` | Ink-gold theme |
| `src/main.ts` | Wire everything |
| `skills/sixlines-divination/*` | Portable skill + INSTALL |

---

### Task 1: Scaffold + Pages config

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.ts`, `src/vite-env.d.ts`, `.github/workflows/deploy.yml`, `README.md` (update)

- [ ] **Step 1:** Init package with deps `three`, devDeps `typescript`, `vite`, `vitest`, `@types/three`
- [ ] **Step 2:** Vite config: `base: process.env.GITHUB_PAGES === 'true' ? '/SixLines/' : '/'`, vitest include `src/**/*.test.ts`
- [ ] **Step 3:** Minimal `index.html` + `main.ts` mounts `#app`
- [ ] **Step 4:** Workflow builds with `GITHUB_PAGES=true` and deploys `dist`
- [ ] **Step 5:** `npm install && npm run build` succeeds
- [ ] **Step 6:** Commit `chore: scaffold vite spa for github pages`

---

### Task 2: Divination core + tests

**Files:**
- Create: `src/divination/types.ts`, `coins.ts`, `hexagram.ts`, `index.ts`, `coins.test.ts`, `hexagram.test.ts`

**Produces:**
- `tossThreeCoins(rng): LineResult` where LineResult = `{ value: 6|7|8|9, yinYang: 'yin'|'yang', changing: boolean, coins: boolean[] }`
- `linesToHexagram(lines: LineResult[]): { primary: number, changed?: number, lines }` — King Wen numbers 1–64
- `binaryToKingWen(bits: number): number` — bits bit0 = bottom line, 1=yang

- [ ] **Step 1:** Write failing tests for sum→line and changing-line transform
- [ ] **Step 2:** Implement coin toss + King Wen lookup table (64 entries)
- [ ] **Step 3:** Tests pass; commit `feat: three-coin hexagram engine`

---

### Task 3: Hexagram data (64)

**Files:**
- Create: `src/data/hexagrams.json`, `src/data/hexagrams.ts`

Each entry: `{ id, name, upper, lower, judgment, lines: string[6], interpretation, nature: 'auspicious'|'neutral'|'inauspicious' }`

- [ ] **Step 1:** Author all 64 classical names + condensed 卦辞/爻辞/解析
- [ ] **Step 2:** Loader `getHexagram(id: number)`
- [ ] **Step 3:** Commit `feat: add sixty-four hexagram corpus`

---

### Task 4: Calendar + judgment + tests

**Files:**
- Create: `src/calendar/ganzhi.ts`, `ganzhi.test.ts`, `src/judgment/verdict.ts`, `verdict.test.ts`

**Produces:**
- `getDayPillars(date: Date): { year, month, day }` Chinese stem-branch strings
- `inferMatterElement(text, category?): WuXing`
- `judgeMatter(opts): { verdict: '宜'|'慎'|'忌', text: string, pillars }`

- [ ] **Step 1:** Failing tests for known date pillars + sample verdicts
- [ ] **Step 2:** Implement approx solar calendar pillars (日柱 from Julian day offset known epoch) + five-element rules
- [ ] **Step 3:** Pass; commit `feat: gan-zhi matter judgment`

---

### Task 5: State machine

**Files:**
- Create: `src/app/state-machine.ts`, `state-machine.test.ts`

Phases: `idle | loadingCoins | shaking | revealing | lineDone | complete`

- [ ] **Step 1:** Tests for six-line progression and reset
- [ ] **Step 2:** Implement; commit `feat: ritual state machine`

---

### Task 6: Three.js scene + audio

**Files:**
- Create: `src/scene/shell.ts`, `coin.ts`, `RitualScene.ts`, `animations.ts`, `src/audio/synth.ts`

- [ ] **Step 1:** Procedural turtle shell + 3 Kaiyuan coins
- [ ] **Step 2:** Timeline APIs: `playLoadCoins()`, `playShakeAndToss(faces: boolean[])`, `playFinale()`
- [ ] **Step 3:** Web Audio: coin, shake, land, bell; mute flag
- [ ] **Step 4:** Commit `feat: procedural 3d ritual scene and sfx`

---

### Task 7: UI + styles + wire main

**Files:**
- Create: `src/styles/main.css`, `src/ui/overlay.ts`, `atlas.ts`, `results.ts`
- Modify: `src/main.ts`, `index.html`

- [ ] **Step 1:** Ink-gold CSS, brand hero, matter input, category chips, mute, atlas button
- [ ] **Step 2:** Results panel + 64-hexagram scroll search
- [ ] **Step 3:** Wire state machine ↔ scene ↔ UI; WebGL fallback text mode
- [ ] **Step 4:** Commit `feat: ritual ui atlas and results`

---

### Task 8: Portable skill + README polish

**Files:**
- Create: `skills/sixlines-divination/SKILL.md`, `INSTALL.md`, `agents/openai.yaml`, `references/*.md`
- Optionally: `.cursor/skills/sixlines-divination` symlink or copy note in INSTALL

- [ ] **Step 1:** Write skill + install for Codex/Cursor/Workbuddy
- [ ] **Step 2:** README: demo URL pattern, Pages setup, skill install
- [ ] **Step 3:** `npm test && npm run build`; commit `feat: agent skill and docs`

---

## Spec Coverage Checklist

- [x] 3D shell + coins → Task 6
- [x] Load/shake/toss motion + SFX → Task 6–7
- [x] Oracle text after hexagram → Task 3, 7
- [x] 64 atlas → Task 7
- [x] Matter + gan-zhi → Task 4, 7
- [x] GitHub Pages → Task 1
- [x] Installable skill → Task 8
