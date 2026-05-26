import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export function getAppDataPath(): string {
  const appDataPath = path.join(app.getPath('userData'), 'panorama-data')
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true })
  }
  return appDataPath
}

export function getDbPath(): string {
  return path.join(getAppDataPath(), 'panorama.db')
}

export function getDocumentsPath(): string {
  const docsPath = path.join(getAppDataPath(), 'documents')
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true })
  }
  return docsPath
}

export function getBackupsPath(): string {
  const backupsPath = path.join(getAppDataPath(), 'backups')
  if (!fs.existsSync(backupsPath)) {
    fs.mkdirSync(backupsPath, { recursive: true })
  }
  return backupsPath
}

export function getLogsPath(): string {
  const logsPath = path.join(getAppDataPath(), 'logs')
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true })
  }
  return logsPath
}
