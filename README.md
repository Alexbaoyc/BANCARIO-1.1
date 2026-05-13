# FinanceMind AI - 金融智能问答平台

面向金融行业的 AI 智能问答平台，采用 React + Express 技术栈构建。

## 部署说明

### 前端部署 (Vercel)

1. **Fork 或推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/finance-ai-qa.git
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 选择刚推送的仓库
   - Framework Preset 选择 "Vite"
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Environment Variables 添加:
     - `VITE_API_URL` = 你的后端 API 地址

3. **后端部署**
   
   由于 Vercel Serverless Functions 不支持 SSE 长连接，后端需要部署到其他服务：
   
   **推荐方案 (Railway)**:
   - 访问 [railway.app](https://railway.app)
   - 连接 GitHub 仓库
   - 部署 `server/index.js`
   - 公开一个 URL 如 `https://xxx.up.railway.app`
   
   **其他可选**:
   - [Render](https://render.com) - 支持持久化服务
   - [Fly.io](https://fly.io) - 支持 Docker 部署
   - 任何 VPS 服务

4. **配置环境变量**
   - 在 Vercel 的 Environment Variables 中设置:
     - `VITE_API_URL` = `https://your-backend.railway.app`

### 开发环境

```bash
# 安装依赖
npm install
cd client && npm install && cd ..

# 启动开发服务器
npm run dev
```

## 技术栈

- **前端**: React 18 + Vite + Lucide Icons
- **后端**: Express.js + SSE 流式响应
- **部署**: Vercel (前端) + Railway (后端)

## 功能特性

- 🎨 科技风格深色主题
- 💬 AI 流式对话响应
- 📊 金融领域专业分析
- 📱 响应式布局
- 🔒 安全的 API 通信
