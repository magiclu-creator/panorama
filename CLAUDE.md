# 全景 (Panorama) — 全能个人管理工具

## 项目概述
Electron 桌面应用，用于全面管理工作和生活。光伏行业从业者使用。

## 技术栈
- Electron + React 18 + TypeScript + Vite
- Ant Design 5.x + Tailwind CSS
- SQLite (better-sqlite3) + Drizzle ORM
- Zustand 状态管理
- Anthropic Claude API (AI 功能)

## 开发命令
- `npm run dev` — 启动开发模式（主进程 + 渲染进程）
- `npm run dev:renderer` — 仅启动 Vite 开发服务器
- `npm run build:renderer` — 构建渲染进程
- `npm run build:main` — 编译主进程
- `npm run build` — 完整构建 + 打包
- `npm run typecheck` — TypeScript 类型检查
- `npm run lint` — ESLint 检查

## 项目结构
- `src/main/` — Electron 主进程（数据库、IPC、服务）
- `src/preload/` — IPC 桥接层（contextBridge）
- `src/renderer/` — React 前端（页面、组件、stores）
- `src/shared/` — 主进程/渲染进程共享类型和常量

## 模块
- Dashboard — 仪表盘
- Tasks — 任务管理（列表 + 看板）
- Calendar — 日历
- Customers — 客户 CRM
- Projects — 项目管理
- Finance — 财务管理
- Solar — 光伏专项（全流程管理）
- Life — 生活管理（健康、习惯、日记）
- Settings — 设置

## 数据库
SQLite 存储在 `userData/panorama-data/panorama.db`
文档存储在 `userData/panorama-data/documents/`
