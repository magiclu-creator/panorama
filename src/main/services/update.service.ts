import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { logger } from '../utils/logger'

let mainWindow: BrowserWindow | null = null

export function initAutoUpdater(win: BrowserWindow): void {
  mainWindow = win
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...')
    sendToRenderer('update:checking')
  })

  autoUpdater.on('update-available', (info) => {
    logger.info('Update available:', info.version)
    sendToRenderer('update:available', info)
  })

  autoUpdater.on('update-not-available', () => {
    logger.info('No update available')
    sendToRenderer('update:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update:progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded:', info.version)
    sendToRenderer('update:downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    logger.error('Auto-updater error:', err)
    sendToRenderer('update:error', { message: err.message })
  })
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch((err) => {
    logger.error('Check for updates failed:', err)
  })
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate().catch((err) => {
    logger.error('Download update failed:', err)
  })
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall()
}

function sendToRenderer(channel: string, data?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}
