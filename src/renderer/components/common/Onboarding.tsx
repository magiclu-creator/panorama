import { useState, useEffect } from 'react'
import { Modal, Steps, Button, Input, Typography, Space, message } from 'antd'
import { KeyOutlined, CheckCircleOutlined, SunOutlined } from '@ant-design/icons'
import { useSettingsStore } from '../../stores/settings.store'

const { Title, Text, Paragraph } = Typography

function Onboarding() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const { settings, fetchSettings, setSetting } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('panorama-onboarding-done')
      if (!dismissed && !settings.aiApiKey) {
        setOpen(true)
      }
    } catch {
      // ignore
    }
  }, [settings.aiApiKey])

  const handleFinish = async () => {
    if (apiKey.trim()) {
      await setSetting('aiApiKey', apiKey.trim())
      message.success('API Key 已保存')
    }
    localStorage.setItem('panorama-onboarding-done', 'true')
    setOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem('panorama-onboarding-done', 'true')
    setOpen(false)
  }

  const steps = [
    {
      title: '欢迎',
      icon: <SunOutlined />,
      content: (
        <div className="onboarding-step">
          <SunOutlined style={{ fontSize: 48, color: 'var(--color-primary)' }} />
          <Title level={4}>欢迎使用全景 Panorama</Title>
          <Paragraph type="secondary">
            全能个人管理工具，帮您管理任务、客户、项目、财务和光伏业务。
            让我们快速完成初始设置。
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'AI 配置',
      icon: <KeyOutlined />,
      content: (
        <div className="onboarding-step">
          <KeyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={4}>配置 AI 助手</Title>
          <Paragraph type="secondary">
            输入 Anthropic API Key 以启用 AI 智能助手、自然语言任务创建、自动分类等功能。
          </Paragraph>
          <Input.Password
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{ maxWidth: 400, marginTop: 16 }}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              可以稍后在设置中配置，不影响其他功能使用
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '完成',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="onboarding-step">
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52C41A' }} />
          <Title level={4}>设置完成</Title>
          <Paragraph type="secondary">
            您可以开始使用全景了。通过侧边栏导航到各个模块，
            使用 Ctrl+K 快速搜索，或点击右上角的 AI 按钮与助手对话。
          </Paragraph>
        </div>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      title="初始设置"
      width={560}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <Steps current={current} items={steps.map((s) => ({ title: s.title, icon: s.icon }))} style={{ marginBottom: 24 }} />
      <div>{steps[current]!.content}</div>
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          {current === 0 && (
            <Button onClick={handleSkip}>跳过设置</Button>
          )}
          {current > 0 && (
            <Button onClick={() => setCurrent(current - 1)}>上一步</Button>
          )}
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={() => setCurrent(current + 1)}>
              {current === 0 ? '开始设置' : '下一步'}
            </Button>
          ) : (
            <Button type="primary" onClick={handleFinish}>
              开始使用
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  )
}

export default Onboarding
