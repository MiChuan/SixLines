# 六爻 · SixLines

龟甲 · 开元通宝 · 三钱六爻占卜仪式剧场（纯前端）。

## 本地运行

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## GitHub Pages

推送到 `main` 后，Actions 工作流会构建并以 `base=/SixLines/` 部署。

仓库 **Settings → Pages → Source** 选 **GitHub Actions**。

线上地址形如：`https://<user>.github.io/SixLines/`

## 使用

1. 输入占卜事宜，可点选用事类别  
2. **装币入甲** → 六次 **摇爻**  
3. 成卦后阅读卦辞、动爻、变卦与干支文言断语（宜/慎/忌）  
4. **六十四卦** 可检索全谱；支持「以此卦演示」

本站为文化体验，不作决策依据。

## Agent Skill

便携包：[`skills/sixlines-divination/`](skills/sixlines-divination/)  
安装说明（Codex / Cursor / Workbuddy）：[`skills/sixlines-divination/INSTALL.md`](skills/sixlines-divination/INSTALL.md)

## 技术

Vite · TypeScript · Three.js · Vitest · Web Audio
