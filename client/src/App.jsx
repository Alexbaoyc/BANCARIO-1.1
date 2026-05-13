import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, TrendingUp, Shield, Lightbulb, RefreshCw } from 'lucide-react'
import './App.css'

const EXAMPLE_QUESTIONS = [
  {
    icon: TrendingUp,
    text: '分析当前A股市场走势与投资机会',
    question: '分析当前A股市场走势与投资机会'
  },
  {
    icon: Shield,
    text: '如何做好投资组合的风险管理？',
    question: '如何做好投资组合的风险管理？'
  },
  {
    icon: Lightbulb,
    text: '普通人如何制定适合自己的投资策略？',
    question: '普通人如何制定适合自己的投资策略？'
  }
]

// API endpoint - use environment variable or fallback to relative path
const API_BASE = import.meta.env.VITE_API_URL || ''

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  useEffect(() => {
    // Check server connection
    fetch(`${API_BASE}/api/health`)
      .then(res => {
        if (res.ok) {
          setConnectionStatus('online')
        } else {
          setConnectionStatus('offline')
        }
      })
      .catch(() => setConnectionStatus('offline'))
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputValue.trim() }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error('请求失败，请稍后重试')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''

      // Add placeholder for AI message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim()
            continue
          }
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content !== undefined) {
                aiContent += data.content
                // Update the last message (AI response)
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: aiContent }
                  return updated
                })
              }
            } catch (err) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err.message)
      // Remove the placeholder message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleExampleClick = (question) => {
    setInputValue(question)
    textareaRef.current?.focus()
  }

  const renderMarkdown = (text) => {
    // Simple markdown rendering
    let html = text
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Lists
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)(<br\/>)?/g, (match) => {
      if (match.includes('<br/>')) {
        return match
      }
      return '<ul>' + match + '</ul>'
    })

    return `<p>${html}</p>`
  }

  return (
    <div className="app">
      {/* Background Grid */}
      <div className="bg-grid" />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg viewBox="0 0 32 32" className="logo-icon">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
              <path d="M4 16 L10 8 L16 16 L22 8 L28 16" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 24 L10 16 L16 24 L22 16 L28 24" stroke="url(#logoGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
            <span className="logo-text">FinanceMind AI</span>
          </div>
          <div className="status">
            <span className={`status-dot ${connectionStatus}`} />
            <span className="status-text">
              {connectionStatus === 'online' ? '在线' : connectionStatus === 'connecting' ? '连接中...' : '离线'}
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="chat-area">
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">
                <Bot size={48} />
              </div>
              <h1>金融智能问答助手</h1>
              <p>基于海量金融数据训练，为您提供专业的投资分析、市场解读和风险管理建议</p>

              <div className="examples">
                <h3>试试这样问</h3>
                <div className="example-cards">
                  {EXAMPLE_QUESTIONS.map((item, index) => (
                    <button
                      key={index}
                      className="example-card"
                      onClick={() => handleExampleClick(item.question)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <item.icon size={20} />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="message-content">
                    {message.role === 'assistant' ? (
                      <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                      />
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                      <span className="message-time">
                        {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant loading">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="loading-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <span className="loading-text">正在分析金融数据...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <div className="error-toast">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <RefreshCw size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="输入您的金融问题..."
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </form>
        <p className="input-hint">
          {inputValue.length}/2000 字符 · Enter 发送 · Shift+Enter 换行
        </p>
      </footer>
    </div>
  )
}

export default App
