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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'

interface SidebarProps {
  collapsed: boolean
  currentPath: string
  onNavigate: (path: string) => void
  onCollapse: (collapsed: boolean) => void
}

interface NavItem {
  key: string
  icon: React.ReactNode
  label: string
}

const workItems: NavItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: '任务' },
  { key: '/calendar', icon: <CalendarOutlined />, label: '日历' },
  { key: '/customers', icon: <TeamOutlined />, label: '客户' },
  { key: '/projects', icon: <ProjectOutlined />, label: '项目' },
  { key: '/finance', icon: <DollarOutlined />, label: '财务' },
  { key: '/solar', icon: <SunOutlined />, label: '光伏' },
]

const lifeItems: NavItem[] = [
  { key: '/life', icon: <HeartOutlined />, label: '生活' },
]

const bottomItems: NavItem[] = [
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
]

function NavSection({
  title,
  items,
  currentPath,
  onNavigate,
  collapsed,
}: {
  title: string
  items: NavItem[]
  currentPath: string
  onNavigate: (path: string) => void
  collapsed: boolean
}) {
  const isActive = (key: string) => currentPath === key

  return (
    <div style={{ marginBottom: 4 }}>
      {!collapsed && (
        <div
          style={{
            padding: '12px 12px 4px',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
      )}
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => onNavigate(item.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: isActive(item.key) ? 500 : 400,
            color: isActive(item.key) ? 'var(--color-primary)' : 'var(--text-secondary)',
            background: isActive(item.key) ? 'var(--color-primary-dim)' : 'transparent',
            transition: 'background 0.1s, color 0.1s',
            marginBottom: 1,
          }}
          onMouseEnter={(e) => {
            if (!isActive(item.key)) {
              e.currentTarget.style.background = 'var(--bg-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(item.key)) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 16, width: 18, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
          </span>
          {!collapsed && <span>{item.label}</span>}
        </div>
      ))}
    </div>
  )
}

function Sidebar({ collapsed, currentPath, onNavigate, onCollapse }: SidebarProps) {
  return (
    <div
      style={{
        width: collapsed ? 56 : 220,
        height: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '14px 0' : '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
          minHeight: 48,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--color-primary)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          P
        </div>
        {!collapsed && (
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: 'var(--text-primary)',
            }}
          >
            全景
          </span>
        )}
      </div>

      {/* Navigation */}
      <div
        style={{
          flex: 1,
          padding: '8px 8px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <NavSection
          title="工作"
          items={workItems}
          currentPath={currentPath}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
        <NavSection
          title="生活"
          items={lifeItems}
          currentPath={currentPath}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
      </div>

      {/* Bottom */}
      <div style={{ padding: '0 8px 8px' }}>
        <NavSection
          title=""
          items={bottomItems}
          currentPath={currentPath}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '8px 4px',
            marginTop: 4,
          }}
        >
          {!collapsed && (
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              v0.1.0
            </span>
          )}
          <div
            onClick={() => onCollapse(!collapsed)}
            style={{
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {collapsed ? <MenuUnfoldOutlined style={{ fontSize: 14 }} /> : <MenuFoldOutlined style={{ fontSize: 14 }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
