import { Layout, Button, Badge, Tooltip, Space } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  RobotOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/app.store'
import { useTheme } from '../../contexts/ThemeContext'

const { Header: AntHeader } = Layout

interface HeaderProps {
  collapsed: boolean
  onToggleSidebar: () => void
  onOpenCommandPalette: () => void
}

function Header({ collapsed, onToggleSidebar, onOpenCommandPalette }: HeaderProps) {
  const setAiPanelOpen = useAppStore((s) => s.setAiPanelOpen)
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <AntHeader
      style={{
        height: 56,
        lineHeight: '56px',
        padding: '0 24px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
    >
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{ fontSize: 16 }}
        />
        <SearchOutlined
          style={{ color: '#BFBFBF', fontSize: 16, cursor: 'pointer' }}
          onClick={onOpenCommandPalette}
        />
        <span
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}
          onClick={onOpenCommandPalette}
        >
          搜索... (Ctrl+K)
        </span>
      </Space>

      <Space size="small">
        <Tooltip title={darkMode ? '浅色模式' : '深色模式'}>
          <Button
            type="text"
            icon={darkMode ? <BulbFilled style={{ fontSize: 18, color: '#FAAD14' }} /> : <BulbOutlined style={{ fontSize: 18 }} />}
            style={{ width: 40, height: 40 }}
            onClick={toggleDarkMode}
          />
        </Tooltip>
        <Tooltip title="AI 助手">
          <Button
            type="text"
            icon={<RobotOutlined style={{ fontSize: 18, color: '#FF8C00' }} />}
            style={{ width: 40, height: 40 }}
            onClick={() => setAiPanelOpen(true)}
          />
        </Tooltip>
        <Tooltip title="通知">
          <Badge count={0} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18 }} />}
              style={{ width: 40, height: 40 }}
            />
          </Badge>
        </Tooltip>
      </Space>
    </AntHeader>
  )
}

export default Header
