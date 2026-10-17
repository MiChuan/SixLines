---
name: sixlines-divination
description: >-
  Maintains and explains the SixLines turtle-shell three-coin I Ching SPA
  (起卦、动爻变卦、干支用事、仪式剧场 3D/音效). Use when working on the SixLines
  repo, hexagram corpus, ritual state machine, gan-zhi judgment, or when the
  user asks about 六爻 / 龟甲 / 开元通宝 / 三钱起卦 in this project.
---

# SixLines Divination

## When to use

- Editing or extending `src/divination`, `src/calendar`, `src/judgment`, `src/scene`, `src/ui`
- Explaining results **using this site's rules** (not inventing alternate methods)
- Installing or updating this skill in Codex / Cursor / Workbuddy — see [INSTALL.md](INSTALL.md)

## Non-goals

- Do not present readings as fate or decision authority; keep the cultural-disclaimer tone
- Do not replace the website with a text-only "online casting" that skips the ritual UX unless the user only wants rule explanation

## Core rules (always)

1. **三钱**: 字=阳=3，背=阴=2；和 6老阴(变阳) / 7少阳 / 8少阴 / 9老阳(变阴)
2. **记爻**: 自下而上六爻 → 本卦；动爻阴阳皆变 → 变卦
3. **编号**: 文王序 1–64；二进制 bit0=初爻，1=阳 → `BIN2WEN` in `src/divination/hexagram.ts`
4. **干支断语**: `judgeMatter` → 宜/慎/忌 + 文言一句；无法识类则要求类别
5. **视觉**: 墨金古卷；程序化龟甲/通宝；Web Audio 合成音效

## Workflow: change casting logic

1. Edit pure modules under `src/divination` or `src/judgment`
2. Add/adjust Vitest in the same folder
3. Run `npm test`
4. Only then touch `src/scene` / `src/ui` if animation must follow new face data

## Workflow: add or edit hexagram text

1. Update `src/data/hexagrams.json` (or regenerate via `scripts/gen-hexagrams.mjs` then hand-edit)
2. Keep fields: `id,name,upper,lower,judgment,lines[6],interpretation,nature`
3. `nature` ∈ `auspicious|neutral|inauspicious` — feeds judgment soft-adjust

## Workflow: ritual UX

State machine phases: `idle → loadingCoins → ready → shaking → revealing → lineDone` (×6) → `complete`.  
Animations receive **precomputed** coin faces from `previewNextLine` — never randomize inside Three.js.

## References

- [references/hexagram-rules.md](references/hexagram-rules.md)
- [references/gan-zhi-judgment.md](references/gan-zhi-judgment.md)
- [references/scene-conventions.md](references/scene-conventions.md)
