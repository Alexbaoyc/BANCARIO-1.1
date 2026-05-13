# 金融 AI 智能问答平台 - SPEC.md

## 1. Concept & Vision

**名称**：FinanceMind AI
**定位**：面向金融行业的专业 AI 问答平台，为投资者、分析师、从业者提供实时智能问答服务。

**核心体验**：专业、可信赖、响应迅速。界面沉稳大气，融合金融数据可视化美学与科技感，让用户在交互中感受到专业与安全感。

---

## 2. Design Language

### 色彩系统
```
--bg-primary:     #0a0e17    (深空背景)
--bg-secondary:   #111827    (卡片背景)
--bg-tertiary:    #1a2235    (输入框/hover)
--accent-primary: #00d4aa    (主强调色 - 科技青)
--accent-secondary: #3b82f6 (次强调色 - 金融蓝)
--text-primary:   #f1f5f9    (主文字)
--text-secondary: #94a3b8    (次文字)
--text-muted:     #475569    (弱文字)
--border:         #1e293b    (边框)
--success:        #10b981
--warning:        #f59e0b
--error:          #ef4444
```

### 字体
- 标题：`"Space Grotesk", "PingFang SC", sans-serif` — 科技感强
- 正文：`"Inter", "PingFang SC", sans-serif` — 高可读性
- 代码/数据：`"JetBrains Mono", monospace`

### 动效哲学
- 入场：fade-in + translateY(20px), 400ms ease-out, 交错 80ms
- 消息气泡：从底部滑入，spring 效果
- 按钮：scale(0.98) on press，hover 时 glow 效果
- 加载：脉冲光效 + 打字机光标
- 背景：微妙的网格渐变动画，营造科技氛围

### 视觉资产
- 图标：Lucide Icons（线性风格，stroke-width: 1.5）
- 装饰：SVG 几何线条、网格背景、粒子点阵
- Logo：自定义 SVG 文字标志

---

## 3. Layout & Structure

### 页面结构
```
┌─────────────────────────────────────┐
│           Header (固定)              │
│  Logo + 标题     + 状态指示器        │
├─────────────────────────────────────┤
│                                     │
│         Chat Area (滚动)             │
│                                     │
│   [User Message Bubble]    →        │
│                                     │
│   ←  [AI Response Bubble]            │
│                                     │
├─────────────────────────────────────┤
│         Input Area (固定)            │
│  [Multi-line Input]    [Send Btn]   │
└─────────────────────────────────────┘
```

### 响应式策略
- Desktop (>1024px)：居中卡片布局，max-width 900px
- Tablet (768-1024px)：全宽布局，padding 32px
- Mobile (<768px)：全屏布局，底部输入框固定

---

## 4. Features & Interactions

### 核心功能
1. **提问输入**
   - 多行文本输入框，支持 Shift+Enter 换行
   - Enter 键提交
   - 空内容禁止提交（按钮置灰）
   - 最大 2000 字符

2. **AI 回答生成**
   - 实时流式输出（打字机效果）
   - 支持 Markdown 渲染（代码块、列表、粗体斜体）
   - 回答完成前显示加载状态
   - 回答完成后显示时间戳

3. **历史对话**
   - 当前会话的消息列表
   - 新消息自动滚动到底部
   - 支持滚动回看历史

### 交互细节
- **发送按钮**：hover 时 scale(1.05) + 发光；disabled 时 opacity 0.5
- **消息气泡**：用户消息右对齐（青绿色），AI 消息左对齐（蓝灰色）
- **加载动画**：三个脉冲圆点 + "正在分析..." 文字
- **空状态**：显示欢迎语 + 示例问题卡片

### 边界情况
- 网络错误：显示红色提示条，3秒后消失，可重试
- 空回答：显示 "抱歉，暂时无法回答这个问题"
- 超长回答：正常显示，区域可滚动

---

## 5. Component Inventory

### Header
- 左侧：Logo (SVG) + "FinanceMind AI"
- 右侧：连接状态指示灯（绿=在线）
- 高度：64px，border-bottom 分隔线

### MessageBubble
- **User**: 右对齐，bg: --accent-primary，文字白色，圆角左长右短
- **AI**: 左对齐，bg: --bg-secondary，边框，文字 --text-primary
- 最大宽度 80%，代码块独立样式

### InputArea
- 左侧：多行 textarea，placeholder "输入您的金融问题..."
- 右侧：发送按钮（图标）
- 背景：--bg-tertiary，圆角 12px

### LoadingDots
- 三个圆点，依次脉冲动画，--accent-secondary 颜色

### ExampleCards（空状态时显示）
- 3 个示例问题卡片
- hover: 边框变亮，scale(1.02)
- 点击自动填入问题

---

## 6. Technical Approach

### 技术栈
- **前端**：React 18 + Vite
- **样式**：CSS Modules + CSS Variables
- **后端**：Express.js
- **AI 集成**：直接调用 OpenClaw / AI 模型 API
- **实时通信**：Server-Sent Events (SSE)

### 项目结构
```
finance-ai-qa/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                 # Express 后端
│   ├── index.js
│   └── routes/
│       └── chat.js
├── package.json
└── SPEC.md
```

### API 设计

**POST /api/chat**
```json
// Request
{ "question": "string" }

// Response (SSE stream)
// event: message
// data: {"content": "string", "done": false}
// event: done
// data: {"content": "", "done": true}
```

### 环境变量
```
PORT=3001
OPENAI_API_KEY=xxx  (可选，如需直接调用)
```
