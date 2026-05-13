import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// MiniMax API Configuration
const MINIMAX_API_KEY = 'sk-api-gPFA4ytcC8lf5fXUFrKeMZ_WlDFZ2THI9Rm7Qi2_8YEAZhp2_cFhwi40PcIimeW1ES3Gd0jiY4S-ZNTTp2qQrT-lIwnHmYuI11eUPG8-_GyqB_er0DPsa90';
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_pro';

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint with SSE streaming
app.post('/api/chat', async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ error: '问题不能为空' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    // Call MiniMax API
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        tokens_to_generate: 1024,
        temperature: 0.9,
        messages: [
          {
            role: 'system',
            content: `你是 FinanceMind AI，一个专业的金融领域智能助手。你专注于：
- 股票市场分析与投资建议
- 风险管理策略
- 投资组合配置建议
- 宏观经济分析
- 加密货币市场解读

请用专业、严谨但易懂的语言回答用户的问题。如果涉及投资建议，请提醒用户"投资有风险，决策需谨慎"。`
          },
          {
            role: 'user',
            content: question
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      sendToClient(res, 'message', { content: '抱歉，AI 服务暂时不可用，请稍后重试。', done: true });
      return res.end();
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].messages && data.choices[0].messages[0]) {
      const aiResponse = data.choices[0].messages[0].content;
      
      // Stream response character by character for effect
      let index = 0;
      const chars = aiResponse.split('');
      
      const interval = setInterval(() => {
        if (index < chars.length) {
          sendToClient(res, 'message', { content: chars[index], done: false });
          index++;
        } else {
          sendToClient(res, 'done', { content: '', done: true });
          clearInterval(interval);
          res.end();
        }
      }, 20);

      req.on('close', () => {
        clearInterval(interval);
      });
    } else {
      console.error('Unexpected API response structure:', JSON.stringify(data).substring(0, 500));
      sendToClient(res, 'message', { content: '抱歉，AI 返回格式异常，请稍后重试。', done: true });
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    sendToClient(res, 'message', { content: '网络错误，请检查连接后重试。', done: true });
    res.end();
  }
});

function sendToClient(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

app.listen(PORT, () => {
  console.log(`🏦 FinanceMind AI Server running on http://localhost:${PORT}`);
  console.log(`🤖 MiniMax API configured`);
});
