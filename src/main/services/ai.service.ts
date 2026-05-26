import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../utils/logger'

let client: Anthropic | null = null
let apiKey: string | null = null

export function setApiKey(key: string): void {
  apiKey = key
  client = new Anthropic({ apiKey: key })
  logger.info('AI service initialized with API key')
}

export function getClient(): Anthropic | null {
  return client
}

export function isConfigured(): boolean {
  return client !== null && apiKey !== null
}

export async function chat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: {
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<{ content: string; tokensUsed: number }> {
  if (!client) {
    throw new Error('AI service not configured. Please set API key in Settings.')
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature ?? 0.7,
      system: options?.systemPrompt || '你是全景 Panorama 的 AI 助手，帮助用户管理工作和生活。请用中文回复。',
      messages,
    })

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('')

    return {
      content,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    }
  } catch (error) {
    logger.error('AI chat error', error)
    throw error
  }
}

export async function classify(
  text: string,
  type: 'task_priority' | 'customer_type' | 'expense_category'
): Promise<{ category: string; confidence: number }> {
  if (!client) {
    return { category: 'general', confidence: 0 }
  }

  const prompts: Record<string, string> = {
    task_priority: `分析以下任务描述，判断其优先级（low/medium/high/urgent）。只返回JSON格式：{"category":"优先级","confidence":0-1}\n\n任务：${text}`,
    customer_type: `分析以下客户信息，判断客户类型（residential/commercial/industrial/government）。只返回JSON格式：{"category":"类型","confidence":0-1}\n\n信息：${text}`,
    expense_category: `分析以下支出描述，判断支出类别（如：材料、人工、设备、差旅、办公等）。只返回JSON格式：{"category":"类别","confidence":0-1}\n\n描述：${text}`,
  }

  try {
    const result = await chat([{ role: 'user', content: prompts[type] || prompts.task_priority! }], {
      maxTokens: 100,
      temperature: 0.1,
    })
    const parsed = JSON.parse(result.content)
    return { category: parsed.category || 'general', confidence: parsed.confidence || 0 }
  } catch {
    return { category: 'general', confidence: 0 }
  }
}

export async function parseIntent(
  text: string
): Promise<{ intent: string; entities: Record<string, unknown> }> {
  if (!client) {
    return { intent: 'unknown', entities: {} }
  }

  const prompt = `分析以下用户输入，提取意图和关键信息。返回JSON格式：
{"intent":"create_task|create_event|create_customer|search|unknown","entities":{"title":"","date":"","time":"","person":"","location":""}}

用户输入：${text}`

  try {
    const result = await chat([{ role: 'user', content: prompt }], {
      maxTokens: 200,
      temperature: 0.1,
    })
    return JSON.parse(result.content)
  } catch {
    return { intent: 'unknown', entities: {} }
  }
}

export async function analyze(
  module: string,
  data: unknown
): Promise<{ insights: string[]; suggestions: string[] }> {
  if (!client) {
    return { insights: [], suggestions: [] }
  }

  const prompt = `分析以下${module}模块的数据，提供洞察和建议。返回JSON格式：
{"insights":["洞察1","洞察2"],"suggestions":["建议1","建议2"]}

数据：${JSON.stringify(data).slice(0, 2000)}`

  try {
    const result = await chat([{ role: 'user', content: prompt }], {
      maxTokens: 500,
      temperature: 0.5,
    })
    return JSON.parse(result.content)
  } catch {
    return { insights: [], suggestions: [] }
  }
}
