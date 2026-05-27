import { Button, Badge, Tooltip, Space } from 'antd'
import {
  SearchOutlined,
  BellOutlined,
  RobotOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/app.store'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  onOpenCommandPalette: () => void
}

function Header({ onOpenCommandPalette }: HeaderProps) {
  const setAiPanelOpen = useAppStore((s) => s.setAiPanelOpen)
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div
      style={{
        height: 48,
        padding: '0 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Search */}
      <div
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '4px 10px',
          borderRadius: 4,
          transition: 'background 0.1s',
          color: 'var(--text-tertiary)',
          fontSize: 13,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <SearchOutlined style={{ fontSize: 14 }} />
        <span>搜索...</span>
        <kbd
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '1px 5px',
            borderRadius: 3,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-tertiary)',
            lineHeight: '16px',
          }}
        >
          Ctrl+K
        </kbd>
      </div>

      {/* Actions */}
      <Space size={4}>
        <Tooltip title={darkMode ? '浅色模式' : '深色模式'}>
          <Button
            type="text"
            size="small"
            icon={
              darkMode ? (
                <BulbFilled style={{ fontSize: 15, color: '#ca8a04' }} />
              ) : (
                <BulbOutlined style={{ fontSize: 15, color: 'var(--text-secondary)' }} />
              )
            }
            style={{ width: 32, height: 32 }}
            onClick={toggleDarkMode}
          />
        </Tooltip>
        <Tooltip title="AI 助手">
          <Button
            type="text"
            size="small"
            icon={<RobotOutlined style={{ fontSize: 15, color: 'var(--color-primary)' }} />}
            style={{ width: 32, height: 32 }}
            onClick={() => setAiPanelOpen(true)}
          />
        </Tooltip>
        <Tooltip title="通知">
          <Badge count={0} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              size="small"
              icon={<BellOutlined style={{ fontSize: 15, color: 'var(--text-secondary)' }} />}
              style={{ width: 32, height: 32 }}
            />
          </Badge>
        </Tooltip>
      </Space>
    </div>
  )
}

export default Header
