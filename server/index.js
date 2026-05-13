import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// SSE clients registry
const clients = new Set();

function sendToClient(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// AI Chat endpoint with SSE streaming
app.post('/api/chat', (req, res) => {
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

  // Send question received confirmation
  sendToClient(res, 'message', { content: '收到您的问题，正在分析金融数据...', done: false });

  // Simulate AI response streaming (in production, connect to real AI)
  const response = generateFinanceAnswer(question);

  let index = 0;
  const chars = response.split('');

  const interval = setInterval(() => {
    if (index < chars.length) {
      sendToClient(res, 'message', { content: chars[index], done: false });
      index++;
    } else {
      sendToClient(res, 'done', { content: '', done: true });
      clearInterval(interval);
      res.end();
    }
  }, 30);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Generate finance-related AI response
function generateFinanceAnswer(question) {
  const q = question.toLowerCase();

  // Market analysis responses
  if (q.includes('行情') || q.includes('股票') || q.includes('走势')) {
    return `根据当前市场数据分析：

**市场概况**
近期全球金融市场呈现分化态势。A 股市场在政策利好支持下整体企稳，沪指在 3000-3300 点区间震荡整理。科技股和新能源板块表现相对强势，而传统周期板块波动较大。

**投资建议**
1. **分散配置**：建议在科技、消费、金融三大板块间均衡配置
2. **关注政策**：紧跟货币政策和财政政策导向，特别是新能源、半导体等国家重点扶持领域
3. **风险控制**：设置合理的止损点位，建议单只股票持仓不超过总仓位的 20%

**技术面分析**
从 K 线形态来看，部分优质个股已形成均线多头排列，MACD 指标出现金叉信号，短期有望延续反弹走势。但需注意成交量配合情况，若量能不足可能制约反弹高度。

如需更具体的个股分析，请提供您关注的股票代码，我将为您进一步解读。`;
  }

  // Risk management
  if (q.includes('风险') || q.includes('止损')) {
    return `金融风险控制是投资成功的关键。以下是专业级风险管理框架：

**仓位管理原则**
• 单只标的仓位不超过总资本的 20%
• 相关性较高的资产组合持仓不超过 40%
• 建议保留 10-20% 的现金仓位应对极端情况

**止损策略**
1. **固定止损**：入场后设定 -8% 至 -15% 的硬止损
2. **移动止损**：跟随趋势上涨时逐步抬高止损位
3. **时间止损**：若持仓超过特定时间未达预期，强制复盘

**风险收益比**
专业投资者通常要求至少 1:2 的风险收益比，即潜在盈利至少是潜在亏损的 2 倍。

**压力测试**
建议定期对投资组合进行极端情景下的回测，确保在黑天鹅事件中组合不至于伤筋动骨。`;
  }

  // Investment strategy
  if (q.includes('投资') || q.includes('策略') || q.includes('配置')) {
    return `基于现代投资组合理论，以下是针对不同风险偏好投资者的配置建议：

**保守型（年化目标 5-8%）**
• 债券/固收：50%
• 宽基指数基金：30%
• 黄金/商品：10%
• 现金：10%

**平衡型（年化目标 8-12%）**
• 股票型基金：50%
• 债券/固收：30%
• 商品/REITs：10%
• 现金：10%

**进取型（年化目标 12%+）**
• 成长股/科技股：40%
• 周期股/价值股：30%
• 行业 ETF：20%
• 黄金/期权：10%

**定期再平衡**
建议每季度进行一次组合检视，当各类资产偏离目标配置 5% 以上时进行再平衡操作。`;
  }

  // Crypto/digital assets
  if (q.includes('比特币') || q.includes('crypto') || q.includes('加密')) {
    return `数字资产市场分析：

**比特币走势**
BTC 近期在 $60,000-$70,000 区间震荡，机构资金持续流入但散户情绪趋于谨慎。ETF 净流入数据显示机构看多态度未变。

**风险提示**
⚠️ 加密货币市场波动性极高，24 小时涨跌幅超过 30% 的情况并不罕见。建议仓位不超过总投资的 5%，且必须使用正规交易平台。

**监管动态**
各国监管政策持续演变，建议关注：
• 美国 SEC 对 ETF 的审批进展
• 欧盟 MiCA 法规实施细节
• 各国央行数字货币（CBDC）推进情况

**技术指标**
从链上数据看，交易所余额持续下降，表明持币者倾向于冷存储，短期抛售压力可控。`;
  }

  // Macro economy
  if (q.includes('gdp') || q.includes('经济') || q.includes('通胀') || q.includes('加息')) {
    return `当前宏观经济形势分析：

**全球经济**
主要经济体增速分化明显。美国经济韧性强于预期，消费和就业市场持续强劲；欧元区增长疲软；中国正在经历结构性转型。

**货币政策**
• **美联储**：点阵图显示 2024 年降息 1-2 次，节奏取决于通胀回落速度
• **欧央行**：已启动降息周期，但步伐谨慎
• **中国人民银行**：维持稳健货币政策，必要时提供流动性支持

**通胀前景**
核心通胀回落趋势确立，但服务类通胀粘性较强。预计全球通胀将在 2025 年逐步回归 2-3% 的舒适区间。

**投资启示**
利率下行周期有利于股债资产表现，建议适度拉长久期，关注高质量债券的配置价值。`;
  }

  // Default response
  return `您的问题已收到。作为金融 AI 助手，我可以为您提供以下方面的专业分析：

**可分析的领域**
📊 **市场分析**：股票、债券、商品、外汇市场走势研判
💹 **投资策略**：资产配置、仓位管理、选股逻辑
📈 **技术分析**：K 线形态、均线系统、技术指标解读
⚠️ **风险管理**：止损设置、仓位控制、风险分散
🏢 **基本面分析**：财务指标、行业前景、公司估值
🌐 **宏观经济**：货币政策、财政政策、通胀利率

——

您当前的问题已记录，我将结合最新市场数据为您深度解读。但由于金融市场的复杂性和不确定性，本分析仅供参考，不构成具体投资建议。投资有风险，决策需谨慎。

如需更深入的分析，请提供：
1. 具体关注的市场或板块
2. 您的投资目标和风险偏好
3. 当前持仓情况（如有）`;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏦 FinanceMind AI Server running on http://localhost:${PORT}`);
});
