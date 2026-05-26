import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { getSqlite } from '../database/connection'

let syncDir: string | null = null

function getDbPath(): string {
  return path.join(app.getPath('userData'), 'panorama.db')
}

export function setSyncDirectory(dir: string): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    syncDir = dir
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function getSyncDirectory(): string | null {
  return syncDir
}

export function syncToCloud(): { success: boolean; error?: string; timestamp?: string } {
  if (!syncDir) {
    return { success: false, error: '未设置同步目录' }
  }
  try {
    const dbPath = getDbPath()
    if (!fs.existsSync(dbPath)) {
      return { success: false, error: '数据库文件不存在' }
    }
    const destPath = path.join(syncDir, 'panorama.db')
    fs.copyFileSync(dbPath, destPath)
    // Write sync metadata
    const metaPath = path.join(syncDir, 'panorama-sync-meta.json')
    const meta = {
      lastSync: new Date().toISOString(),
      deviceId: getDeviceId(),
      dbSize: fs.statSync(dbPath).size,
    }
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
    return { success: true, timestamp: meta.lastSync }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function syncFromCloud(): { success: boolean; error?: string; timestamp?: string } {
  if (!syncDir) {
    return { success: false, error: '未设置同步目录' }
  }
  try {
    const srcPath = path.join(syncDir, 'panorama.db')
    if (!fs.existsSync(srcPath)) {
      return { success: false, error: '云端数据库文件不存在' }
    }
    const dbPath = getDbPath()
    // Close current connection before overwriting
    const db = getSqlite()
    db.close()
    fs.copyFileSync(srcPath, dbPath)
    return { success: true, timestamp: new Date().toISOString() }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function getSyncStatus(): { syncDir: string | null; lastSync: string | null; deviceId: string } {
  let lastSync: string | null = null
  if (syncDir) {
    const metaPath = path.join(syncDir, 'panorama-sync-meta.json')
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        lastSync = meta.lastSync
      } catch {
        // ignore
      }
    }
  }
  return { syncDir, lastSync, deviceId: getDeviceId() }
}

function getDeviceId(): string {
  const idPath = path.join(app.getPath('userData'), 'device-id')
  if (fs.existsSync(idPath)) {
    return fs.readFileSync(idPath, 'utf-8').trim()
  }
  const id = `panorama-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  fs.writeFileSync(idPath, id)
  return id
}
