import { create } from 'zustand'

interface AppState {
  sidebarCollapsed: boolean
  currentModule: string
  aiPanelOpen: boolean
  commandPaletteOpen: boolean
  loading: boolean
  error: string | null

  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentModule: (module: string) => void
  setAiPanelOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentModule: 'dashboard',
  aiPanelOpen: false,
  commandPaletteOpen: false,
  loading: false,
  error: null,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentModule: (module) => set({ currentModule: module }),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
