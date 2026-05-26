import { create } from 'zustand'

interface SettingsState {
  settings: Record<string, unknown>
  loading: boolean

  fetchSettings: () => Promise<void>
  setSetting: (key: string, value: unknown) => Promise<void>
  getSetting: <T = unknown>(key: string, defaultValue?: T) => T
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.app.getSettings()
      set({ settings: result as Record<string, unknown>, loading: false })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      set({ loading: false })
    }
  },

  setSetting: async (key, value) => {
    try {
      await window.panorama.app.setSetting(key, value)
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }))
    } catch (error) {
      console.error('Failed to set setting:', error)
    }
  },

  getSetting: <T = unknown>(key: string, defaultValue?: T): T => {
    const { settings } = get()
    return (settings[key] as T) ?? (defaultValue as T)
  },
}))
