import { useState, useRef, useEffect, useCallback } from 'react'
import { Drawer, Input, Button, Space, Typography, Spin, message, Tag } from 'antd'
import { SendOutlined, ClearOutlined, AudioOutlined, AudioMutedOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useAppStore } from '../../stores/app.store'
import { useTaskStore } from '../../stores/task.store'

const { Text } = Typography

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  action?: { type: string; data: Record<string, unknown>; executed?: boolean }
}

function AIAssistant() {
  const { aiPanelOpen, setAiPanelOpen } = useAppStore()
  const { createTask } = useTaskStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // First, try to parse intent
      const intentResult = await window.panorama.ai.parseIntent(text) as { intent: string; entities: Record<string, unknown> }

      if (intentResult.intent === 'create_task' && intentResult.entities.title) {
        // Auto-create task
        const taskData = {
          title: intentResult.entities.title as string,
          description: (intentResult.entities.description as string) || '',
          priority: (intentResult.entities.priority as string) || 'medium',
          dueDate: intentResult.entities.date as string || undefined,
          status: 'pending' as const,
        }

        const actionMsg: ChatMessage = {
          role: 'assistant',
          content: `已为您创建任务：「${taskData.title}」${taskData.dueDate ? `，截止日期 ${taskData.dueDate}` : ''}`,
          action: { type: 'create_task', data: taskData, executed: false },
        }
        setMessages((prev) => [...prev, actionMsg])
      } else if (intentResult.intent === 'create_event' && intentResult.entities.title) {
        const actionMsg: ChatMessage = {
          role: 'assistant',
          content: `已识别日程：「${intentResult.entities.title}」${intentResult.entities.date ? `，日期 ${intentResult.entities.date}` : ''}。请在日历模块中确认创建。`,
          action: { type: 'create_event', data: intentResult.entities, executed: false },
        }
        setMessages((prev) => [...prev, actionMsg])
      } else {
        // General chat
        const result = await window.panorama.ai.chat([...messages, userMessage])
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: (result as { content: string }).content || '抱歉，我无法处理这个请求。',
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch {
      message.error('AI 请求失败，请检查 API Key 配置')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '请求失败，请在设置中配置 Anthropic API Key。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteAction = async (msgIndex: number) => {
    const msg = messages[msgIndex]
    if (!msg?.action || msg.action.executed) return

    try {
      if (msg.action.type === 'create_task') {
        await createTask(msg.action.data as Parameters<typeof createTask>[0])
        message.success('任务已创建')
      }
      // Mark as executed
      setMessages((prev) => prev.map((m, i) =>
        i === msgIndex && m.action ? { ...m, action: { ...m.action, executed: true } } : m
      ))
    } catch {
      message.error('执行失败')
    }
  }

  const handleClear = () => {
    setMessages([])
  }

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      message.error('当前环境不支持语音识别')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      if (result) {
        const text = result[0]?.transcript || ''
        setTranscript(text)
        if (result.isFinal) {
          setInput(text)
          setListening(false)
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setListening(false)
      if (event.error === 'not-allowed') {
        message.error('请允许麦克风权限')
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return (
    <Drawer
      title="AI 助手"
      open={aiPanelOpen}
      onClose={() => setAiPanelOpen(false)}
      width={420}
      extra={
        <Button icon={<ClearOutlined />} size="small" onClick={handleClear}>
          清空
        </Button>
      }
    >
      {/* Messages */}
      <div
        style={{
          height: 'calc(100vh - 240px)',
          overflowY: 'auto',
          padding: '0 0 16px',
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
            <Text type="secondary">
              你好！我是全景 AI 助手。
              <br />
              可以帮你创建任务、分析数据、回答问题。
            </Text>
            <div style={{ marginTop: 16, fontSize: 12, color: '#bfbfbf' }}>
              试试说："帮我创建一个明天截止的任务"
              <br />
              或点击麦克风用语音输入
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--bg-elevated)',
                color: msg.role === 'user' ? '#fff' : '#333',
                whiteSpace: 'pre-wrap',
                fontSize: 14,
              }}
            >
              {msg.content}
              {msg.action && !msg.action.executed && (
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleExecuteAction(i)}
                  >
                    确认执行
                  </Button>
                </div>
              )}
              {msg.action?.executed && (
                <div style={{ marginTop: 4 }}>
                  <Tag color="success">已执行</Tag>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <Spin size="small" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice transcript */}
      {transcript && (
        <div style={{ padding: '4px 0', fontSize: 12, color: '#8c8c8c' }}>
          识别中: {transcript}
        </div>
      )}

      {/* Input */}
      <Space.Compact style={{ width: '100%' }}>
        <Button
          type={listening ? 'primary' : 'default'}
          icon={listening ? <AudioOutlined /> : <AudioMutedOutlined />}
          onClick={listening ? stopListening : startListening}
          danger={listening}
          style={{ flexShrink: 0 }}
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder={listening ? '正在聆听...' : '输入消息或按麦克风语音输入...'}
          disabled={loading || listening}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={!input.trim()}
        />
      </Space.Compact>
    </Drawer>
  )
}

export default AIAssistant
