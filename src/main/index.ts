import { app, BrowserWindow, ipcMain } from 'electron'
import { createWindow } from './window'
import { initializeDatabase, closeDatabase, getSqlite } from './database/connection'
import { registerAllIpcHandlers } from './ipc'
import { initAutoUpdater, checkForUpdates, downloadUpdate, installUpdate } from './services/update.service'
import { setApiKey } from './services/ai.service'
import { startReminderEngine } from './services/reminder.service'

let mainWindow: BrowserWindow | null = null

function isDev(): boolean {
  return !app.isPackaged
}

async function initialize(): Promise<void> {
  // Initialize database
  await initializeDatabase()

  // Load AI API key from settings
  try {
    const db = getSqlite()
    const row = db.prepare("SELECT value FROM app_settings WHERE key = 'aiApiKey'").get() as { value: string } | undefined
    if (row?.value) {
      setApiKey(row.value)
    }
  } catch {
    // Settings table may not exist yet
  }

  // Register IPC handlers
  registerAllIpcHandlers()

  // Start reminder engine
  startReminderEngine()

  // Create main window
  mainWindow = createWindow(isDev())

  // Initialize auto-updater (production only)
  if (!isDev()) {
    initAutoUpdater(mainWindow)
    // Check for updates on startup after a delay
    setTimeout(() => checkForUpdates(), 5000)
  }

  // Update IPC handlers
  ipcMain.handle('update:check', () => checkForUpdates())
  ipcMain.handle('update:download', () => downloadUpdate())
  ipcMain.handle('update:install', () => installUpdate())

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow(isDev())
    }
  })
}

app.whenReady().then(initialize)

app.on('before-quit', () => {
  closeDatabase()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
