# 六爻 · SixLines

龟壳摇卦 · 开元通宝 · 三钱六爻（纯前端）。

交互参考经典「点击龟壳逐爻摇卦」流程：默念所问 → 点龟甲六次成卦 → 读卦辞与干支断语。

## 本地运行

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

构建产物在 `dist/`。资源使用相对路径（`base: './'`），可同时用于 GitHub Pages 子目录与 Cloudflare Pages 根路径。

## 使用

1. （可选）填写占卜事宜，或点选用事类别  
2. **点击龟壳**开始第 1 次摇卦；三枚通宝显出正反，右侧记下该爻  
3. 重复至六次；成卦区自下而上为初爻→上爻，并显示「还剩 N 次」  
4. 成卦后阅读卦辞、动爻、变卦，以及当日干支文言断语（宜 / 慎 / 忌）  
5. **六十四卦**可检索全谱；支持「以此卦演示」

铜钱规则：汉字面为阳，光背为阴（开元通宝）。

本站为《周易》文化体验，不作决策依据。

## 部署

### Cloudflare Pages（推荐根路径）

| 项 | 值 |
|----|-----|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/`（仓库根） |

部署后打开 `*.pages.dev` 应能看到龟壳摇卦台。若仍空白：打开开发者工具 Network，确认 `assets/*.js` 为 **200**（不要再指向 `/SixLines/assets/...`）。

也可用 Wrangler 直接上传本地产物：

```bash
npm run build
npx wrangler pages deploy dist --project-name=sixlines
```

### GitHub Pages

推送到 `main` 后，Actions 构建并部署 `dist`。

请先在 **Settings → Pages → Source** 选择 **GitHub Actions**。

线上地址：`https://<user>.github.io/SixLines/`  
（本仓库示例：https://michuan.github.io/SixLines/）

## Agent Skill

便携包：[`skills/sixlines-divination/`](skills/sixlines-divination/)  

可安装到 **Codex / Cursor / Workbuddy**，步骤见 [`skills/sixlines-divination/INSTALL.md`](skills/sixlines-divination/INSTALL.md)。

## 技术

Vite · TypeScript · SVG 龟壳舞台 · Vitest · Web Audio
