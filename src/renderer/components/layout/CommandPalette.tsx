import { useEffect, useRef } from 'react'
import { Modal, Input, List, Tag, Empty, Spin, Typography } from 'antd'
import {
  SearchOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'

const { Text } = Typography

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const moduleIcons: Record<string, React.ReactNode> = {
  tasks: <CheckSquareOutlined style={{ color: '#FF8C00' }} />,
  customers: <TeamOutlined style={{ color: '#1890ff' }} />,
  projects: <ProjectOutlined style={{ color: '#52C41A' }} />,
  events: <CalendarOutlined style={{ color: '#722ED1' }} />,
  solar: <SunOutlined style={{ color: '#FAAD14' }} />,
}

const moduleLabels: Record<string, string> = {
  tasks: '任务',
  customers: '客户',
  projects: '项目',
  events: '日程',
  solar: '光伏',
}

function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { query, setQuery, results, loading } = useSearch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [open, setQuery])

  const handleSelect = (module: string) => {
    navigate(`/${module}`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
      styles={{
        body: { padding: 0, maxHeight: 500, overflow: 'auto' },
      }}
      destroyOnClose
    >
      {/* Search Input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ color: '#BFBFBF' }} />}
          placeholder="搜索任务、客户、项目... 或输入 AI 命令"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="borderless"
          size="large"
          style={{ fontSize: 16 }}
        />
      </div>

      {/* Results */}
      <div style={{ padding: '8px 0' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="未找到匹配结果"
            style={{ padding: 24 }}
          />
        )}

        {!loading && results.length > 0 && (
          <List
            dataSource={results}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleSelect(item.module)}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <List.Item.Meta
                  avatar={moduleIcons[item.module]}
                  title={
                    <span>
                      {item.title}
                      <Tag
                        style={{ marginLeft: 8, fontSize: 11 }}
                        color="default"
                      >
                        {moduleLabels[item.module]}
                      </Tag>
                    </span>
                  }
                  description={item.subtitle}
                />
              </List.Item>
            )}
          />
        )}

        {!loading && !query && (
          <div style={{ padding: '16px', color: '#8c8c8c', textAlign: 'center' }}>
            <Text type="secondary">
              输入关键词搜索，或使用自然语言创建任务
            </Text>
            <div style={{ marginTop: 12, fontSize: 12, color: '#bfbfbf' }}>
              例如: "明天下午3点提醒我给王工打电话"
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CommandPalette
