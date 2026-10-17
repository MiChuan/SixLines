# 安装 sixlines-divination Skill

本目录为便携包：复制整个 `sixlines-divination/` 文件夹即可。入口永远是 `SKILL.md`。

## Cursor

**个人技能（全局）**

```text
复制到: ~/.cursor/skills/sixlines-divination/
```

Windows 示例：

```powershell
Copy-Item -Recurse "D:\Project\GitHub\SixLines\skills\sixlines-divination" "$env:USERPROFILE\.cursor\skills\sixlines-divination"
```

**项目级**：复制到仓库 `.cursor/skills/sixlines-divination/`（与团队共享）。

重启 Cursor 或新开 Agent 会话后，描述中含「六爻 / SixLines」时应可发现本 skill。

## Codex

复制到 Codex skills 目录（常见为 `$CODEX_HOME/skills/`，默认 `~/.codex/skills/`）：

```powershell
Copy-Item -Recurse ".\skills\sixlines-divination" "$env:USERPROFILE\.codex\skills\sixlines-divination"
```

保留 `agents/openai.yaml`。若 `CODEX_HOME` 非默认，先确认再复制。

## Workbuddy

1. 查找 Workbuddy 文档中的 Skills / Agent Skills 目录（常见候选：`~/.workbuddy/skills/`、应用数据目录下的 `skills/`）。
2. 将本文件夹完整复制到该目录，名称保持 `sixlines-divination`。
3. 若候选路径均不存在：**询问用户**其 Workbuddy skill 根目录，再复制；勿猜测写盘。

## 校验

- `SKILL.md` 含 YAML `name: sixlines-divination`
- 宿主能列出该 skill，或在对话中 `@` / `$sixlines-divination` 可引用（视宿主而定）
