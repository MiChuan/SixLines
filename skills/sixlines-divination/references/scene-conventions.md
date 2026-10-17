# 场景约定

- 程序化模型：`src/scene/shell.ts`、`coin.ts`；禁止依赖外部 GLB
- 动画 API：`playLoadCoins` → `playShakeAndToss(faces)` → `playRecall` → `playFinale`
- 钱币正反在摇前由状态机预掷，Three 层只演绎
- 音效：`RitualAudio` Web Audio；首次手势 `unlock()`；可静音
- 主题：墨金；字体 Ma Shan Zheng + Noto Serif SC
