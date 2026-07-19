# ZCode Timeline

ZCode 桌面客户端的会话时间线侧边栏。原生集成、升级安全、不破坏 ZCode 安装。

每条 user message 对应一根 bar，hover 楼梯式展开，点击跳转到该消息，hover 500ms 显示 prompt 前 100 字缩略。

---

## 安装 / 快速开始

需要 **Node.js ≥ 18** 和 **ZCode 已安装**（路径默认 `S:\ZCode\`）。

```bash
cd S:/zcode_timeline
npm install
npm run build          # 生成 dist/timeline.iife.js
npm run start          # = node launcher/launcher.mjs
```

`npm run start` 会：

1. 检测 `ZCode.exe`（自动扫常见安装路径 / 用 `Get-Process` 找运行中的实例）
2. **asar patch** —— 给 ZCode 的 `resources/app.asar` 注入 `--remote-debugging-port=9229` flag。原 asar 备份到 `app.asar.original-<hash>`，可随时还原
3. 通过 **CDP (Chrome DevTools Protocol)** 连接到 9229 端口
4. **注入 React bundle** 到 ZCode 渲染进程
5. 心跳 + hot reload：每 3s 检测 `.zcode-timeline-rail` marker，丢了就 re-inject；`dist/timeline.iife.js` 文件变动也自动重发

> Ctrl+C 关 launcher，**ZCode 不会被一起关**，timeline UI 继续在 ZCode 里跑。

## ZCode 升级后

**自动适配，无需人工干预。**

asar-patcher 通过 SHA-256 检测 app.asar 变化：

- 首次安装：备份当前 asar → 注入 marker → atomic rename
- ZCode 升级：launcher 下次启动时发现 hash 变了 → 备份新原始 asar → 重新 patch → atomic rename
- 备份数量默认 **1 份**（`MAX_BACKUPS=1`），多余自动删，避免占满磁盘

```bash
# 想保留更多备份就加这个 env
set ZCODE_TIMELINE_MAX_BACKUPS=3
npm run start
```

## 卸载 / 还原

```bash
# 1. 还原 ZCode asar 到原始（未 patch）状态
powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1

# 2. 删项目目录
rm -rf S:/zcode_timeline
```

`restore-zcode-snapshot.ps1` 默认会自动备份当前 asar 到 `app.asar.before-restore-<timestamp>`，**即使改主意也能找回**。支持 `-Index N` 选特定备份、`-WhatIf` dry-run、`-Force` 跳过提示。

---

## 它是什么（不是普通插件）

| 层 | 是什么 | 改了什么 |
|---|---|---|
| **Launcher** (`launcher/*.mjs`) | Node 脚本，启/守注入 | 不改 ZCode |
| **asar patch** | 给 ZCode main bundle prepend 一个 `commandLine.appendSwitch('remote-debugging-port','9229')` 块 | 改 `S:\ZCode\resources\app.asar`（原文件备份） |
| **Timeline bundle** (`timeline-src/*.tsx`) | React 19 应用，编译成单个 IIFE，通过 CDP 注入 | 不写文件，纯运行时 DOM |

> ZCode 主进程代码**完全没改**，只多了一个 CDP flag；timeline UI 是 ZCode 自己渲染进程里的纯前端 DOM，读 user message DOM 渲染侧栏。

---

## 项目结构

```
S:/zcode_timeline/
├── package.json              # npm scripts + deps
├── tsconfig.json             # TS 配置（编辑器用）
├── .gitignore
├── README.md
├── launcher/
│   ├── launcher.mjs          # 主流程：patch + attach + inject + heartbeat + hot reload
│   ├── cdp.mjs               # chrome-remote-interface 封装
│   ├── asar-patcher.mjs      # SHA-256 升级检测 + atomic patch + MAX_BACKUPS prune
│   ├── zcode-finder.mjs      # 找 ZCode.exe（env / 常见路径 / Get-Process）
│   ├── launcher.bat          # Windows 双击启动
│   └── start-zcode-clean.mjs # OPT-IN: 杀所有 ZCode（需 START_ZCODE_CLEAN_CONFIRM=yes-do-it）
├── timeline-src/
│   ├── index.tsx             # bundle 入口（导出 mount / unmount / refresh / diagnose）
│   ├── TimelinePanel.tsx     # single-instance 模式，host 在 chat 左缘固定
│   ├── Bar.tsx               # 单根 bar，hover 楼梯展开，点击跳转，500ms tooltip
│   ├── Tooltip.tsx           # React Portal → document.body，前 100 字 + viewport clamp
│   ├── store.ts              # 模块级 state（messages / hovered / tooltipId）
│   ├── message-collector.ts  # MutationObserver（scope 到 chat 容器）+ textContent 优先
│   ├── scroll-to.ts          # 平滑滚动 + flash 高亮（WeakMap timer 清理）
│   ├── dom-probe.ts          # 14 个 user-message 选择器 + 找 scroll container
│   ├── styles.css            # 全部样式（zcode-timeline-* 命名空间）
│   └── build.mjs             # esbuild → dist/timeline.iife.js（IIFE + 原子 tmp/rename）
├── dist/                     # build 产物（gitignore）
├── scripts/
│   ├── hot-reload.mjs        # dev mode: 文件改动 → 重新 build（传 --dev，unminified + sourcemap）
│   ├── verify-patch.mjs      # 检查 patch / state / CDP / bundle 状态
│   ├── probe-dom.mjs         # `npm run probe`
│   ├── list-asar.mjs         # 列 asar 顶层结构
│   ├── restore-zcode-snapshot.ps1
│   └── _debug/               # 调试 probe 集合（gitignore）
└── .state.json               # 升级检测状态（gitignore）
```

---

## 开发模式

```bash
npm run dev    # = node scripts/hot-reload.mjs
```

监听 `timeline-src/**/*.{ts,tsx,css,mjs}`，改动后自动 `node timeline-src/build.mjs --dev`（**unminified + inline sourcemap**）。launcher 的 `fsWatch(DIST_FILE)` 看到 bundle 变了就自动 re-inject 到 ZCode。改完代码几秒内就能在 ZCode 看到效果。

---

## npm scripts

| 命令 | 作用 |
|---|---|
| `npm run build` | 生产构建（minified） |
| `npm run build:dev` | 开发构建（unminified + sourcemap） |
| `npm run dev` | 监听源码改动 + 自动重建 + 自动 re-inject |
| `npm run start` | 启动 launcher（patch asar + 注入 bundle + 心跳） |
| `npm run start:clean` | OPT-IN 杀所有 ZCode 后重启（需 env 确认） |
| `npm run verify` | 检查 patch / state / CDP 状态 |
| `npm run probe` | 探测 user message DOM 选择器命中情况 |
| `npm run clean` | 删 `dist/` |

---

## 环境变量

| 变量 | 默认 | 作用 |
|---|---|---|
| `ZCODE_EXE` | _（自动扫）_ | 显式指定 ZCode.exe 路径 |
| `ZCODE_TIMELINE_PORT` | `9229` | CDP 端口（asar patch + launcher 都会跟着改） |
| `ZCODE_TIMELINE_DISABLE` | _（未设）_ | 设置后跳过 patch（只跑 launcher 不开 9229） |
| `ZCODE_TIMELINE_MAX_BACKUPS` | `1` | 最多保留几份 `.original-<hash>` 备份 |

---

## 约束（用户硬规则，本项目全程遵守）

1. **不杀现有 ZCode 实例** —— launcher 检测到 9229 已 bind 就直接 attach，从不 `taskkill`。spawn 后探测到端口被别人的 ZCode 占用会 kill 自己刚 spawn 的 child（不算"杀现有实例"）。
2. **不破坏 `S:\ZCode\`** —— asar patch 用 `.new` 临时文件 + `renameSync` 原子换名；EPERM 时**绝不**回退到非原子 `writeFileSync`（会半截损坏原 asar），而是返回 failed 提示用户关 ZCode 重试。
3. **永远保留原 asar 备份** —— `app.asar.original-<hash>` 始终至少留 1 份（`MAX_BACKUPS=1`），多余的自动删。

---

## 故障排查

**9229 端口没起来 / launcher attach 不上**：
```bash
npm run verify   # 检查 asar 是否已 patch + CDP 端口是否 bind
```

**bundle 注入但 UI 不显示**：
```bash
npm run probe    # 探测 user message 选择器命中情况
```

**完全还原 ZCode**：
```bash
powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1
```

**手动指定 ZCode 路径**（如果自动检测失败）：
```bash
set ZCODE_EXE=C:\Path\To\ZCode.exe
npm run start
```

---

## License

MIT