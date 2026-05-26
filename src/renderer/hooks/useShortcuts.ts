import { useEffect, useRef } from 'react'

interface ShortcutHandlers {
  onCommandPalette?: () => void
  onNewTask?: () => void
  onNewEvent?: () => void
  onEscape?: () => void
  onToggleAI?: () => void
  onNavigate?: (path: string) => void
}

export function useShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current
      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+K - Command palette
      if (ctrl && e.key === 'k') {
        e.preventDefault()
        h.onCommandPalette?.()
        return
      }

      // Ctrl+N - New task
      if (ctrl && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        h.onNewTask?.()
        return
      }

      // Ctrl+Shift+N - New event
      if (ctrl && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        h.onNewEvent?.()
        return
      }

      // Ctrl+Shift+A - Toggle AI assistant
      if (ctrl && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        h.onToggleAI?.()
        return
      }

      // Escape - Close panels
      if (e.key === 'Escape') {
        h.onEscape?.()
        return
      }

      // Ctrl+1-9 - Navigate to modules
      if (ctrl && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const paths = ['/dashboard', '/tasks', '/calendar', '/customers', '/projects', '/finance', '/solar', '/life', '/settings']
        const idx = parseInt(e.key) - 1
        if (paths[idx]) {
          h.onNavigate?.(paths[idx]!)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
