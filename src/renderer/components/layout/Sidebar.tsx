import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  TeamOutlined,
  ProjectOutlined,
  DollarOutlined,
  SunOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider } = Layout
const { Text } = Typography

interface SidebarProps {
  collapsed: boolean
  currentPath: string
  onNavigate: (path: string) => void
  onCollapse: (collapsed: boolean) => void
}

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: '任务',
  },
  {
    key: '/calendar',
    icon: <CalendarOutlined />,
    label: '日历',
  },
  {
    key: '/customers',
    icon: <TeamOutlined />,
    label: '客户',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: '项目',
  },
  {
    key: '/finance',
    icon: <DollarOutlined />,
    label: '财务',
  },
  {
    key: '/solar',
    icon: <SunOutlined />,
    label: '光伏',
  },
  {
    key: '/life',
    icon: <HeartOutlined />,
    label: '生活',
  },
  {
    type: 'divider',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
]

function Sidebar({ collapsed, currentPath, onNavigate, onCollapse }: SidebarProps) {
  const selectedKeys = [currentPath]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      collapsedWidth={64}
      style={{
        height: '100vh',
        backgroundColor: '#1E3A5F',
      }}
      trigger={null}
    >
      {/* Logo */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <SunOutlined
          style={{
            fontSize: 28,
            color: '#FF8C00',
            marginRight: collapsed ? 0 : 12,
          }}
        />
        {!collapsed && (
          <Text
            strong
            style={{
              color: '#FFFFFF',
              fontSize: 20,
              letterSpacing: 2,
            }}
          >
            全景
          </Text>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={({ key }) => onNavigate(key)}
        style={{
          backgroundColor: 'transparent',
          borderRight: 'none',
        }}
        theme="dark"
      />

      {/* Version */}
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 12 }}>
            v0.1.0
          </Text>
        </div>
      )}
    </Sider>
  )
}

export default Sidebar
