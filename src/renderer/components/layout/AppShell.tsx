import { useCallback } from 'react'
import { Layout } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import CommandPalette from './CommandPalette'
import AIAssistant from '../ai/AIAssistant'
import Onboarding from '../common/Onboarding'
import { useShortcuts } from '../../hooks/useShortcuts'
import { useAppStore } from '../../stores/app.store'

const { Content } = Layout

interface AppShellProps {
  children: React.ReactNode
}

function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, setSidebarCollapsed, commandPaletteOpen, setCommandPaletteOpen, setAiPanelOpen } = useAppStore()

  const currentPath = location.pathname

  const handleToggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(!commandPaletteOpen)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleCloseCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [setCommandPaletteOpen])

  const handleNewTask = useCallback(() => {
    navigate('/tasks')
  }, [navigate])

  const handleNewEvent = useCallback(() => {
    navigate('/calendar')
  }, [navigate])

  const handleToggleAI = useCallback(() => {
    setAiPanelOpen(true)
  }, [setAiPanelOpen])

  useShortcuts({
    onCommandPalette: handleToggleCommandPalette,
    onEscape: handleCloseCommandPalette,
    onNewTask: handleNewTask,
    onNewEvent: handleNewEvent,
    onToggleAI: handleToggleAI,
    onNavigate: navigate,
  })

  return (
    <Layout style={{ height: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        currentPath={currentPath}
        onNavigate={navigate}
        onCollapse={setSidebarCollapsed}
      />
      <Layout>
        <Header
          onOpenCommandPalette={handleToggleCommandPalette}
        />
        <Content
          style={{
            height: 'calc(100vh - 48px)',
            overflow: 'auto',
            backgroundColor: 'var(--bg-page)',
            transition: 'background-color 0.2s',
          }}
        >
          {children}
        </Content>
      </Layout>

      <Onboarding />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={handleCloseCommandPalette}
      />
      <AIAssistant />
    </Layout>
  )
}

export default AppShell
