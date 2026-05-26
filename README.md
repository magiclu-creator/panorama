# 全景 Panorama

全能个人管理工具 — Electron 桌面应用

## 下载安装

前往 [Releases](https://github.com/magiclu-creator/panorama/releases) 页面下载 `panorama-0.1.0-setup.exe`，双击运行即可安装。

## 功能模块

| 模块 | 功能 |
|---|---|
| 仪表盘 | 实时统计、AI 洞察分析、图表可视化 |
| 任务管理 | 列表+看板双视图、拖拽持久化、状态/优先级管理 |
| 日历 | FullCalendar 月视图、事件创建 |
| 客户 CRM | 客户档案、沟通记录、搜索筛选 |
| 项目管理 | 进度追踪、预算管理 |
| 财务管理 | 收支记录、月度趋势图、支出分类饼图 |
| 光伏专项 | 7阶段管线视图（踏勘→运维）、发电量分析 |
| 生活管理 | 健康追踪、日记、习惯打卡、学习目标 |
| AI 助手 | 语音输入、自然语言创建任务、数据智能分析 |

## 快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+K` | 全局搜索 |
| `Ctrl+N` | 新建任务 |
| `Ctrl+Shift+N` | 新建日程 |
| `Ctrl+Shift+A` | 打开 AI 助手 |
| `Ctrl+1~9` | 快速切换模块 |
| `Esc` | 关闭面板 |

## 技术栈

- **框架**: Electron 33
- **前端**: React 18 + TypeScript + Vite
- **UI**: Ant Design 5 + Tailwind CSS
- **状态管理**: Zustand
- **数据库**: SQLite (better-sqlite3)
- **AI**: Anthropic Claude API
- **图表**: ECharts
- **打包**: electron-builder (NSIS)

## 开发

```bash
# 克隆仓库
git clone https://github.com/magiclu-creator/panorama.git
cd panorama

# 安装依赖
npm install

# 重新编译 better-sqlite3 for Electron
npx electron-rebuild -f -w better-sqlite3

# 启动开发环境
npm run dev

# 构建安装包
npm run build
```

## 项目结构

```
panorama/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── database/   # SQLite 数据库
│   │   ├── ipc/        # IPC 通信处理
│   │   └── services/   # AI、备份、同步等服务
│   ├── preload/        # 安全桥接层
│   ├── renderer/       # React 前端
│   │   ├── components/ # 通用组件、布局、图表
│   │   ├── pages/      # 各模块页面
│   │   ├── stores/     # Zustand 状态管理
│   │   └── hooks/      # 自定义 Hooks
│   └── shared/         # 共享类型和常量
├── electron-builder.yml
└── package.json
```

## 许可证

MIT
