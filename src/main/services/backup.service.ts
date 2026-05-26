import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { getSqlite } from '../database/connection'

function getBackupDir(): string {
  const dir = path.join(app.getPath('userData'), 'backups')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function getDbPath(): string {
  return path.join(app.getPath('userData'), 'panorama.db')
}

export function createBackup(): { success: boolean; path: string; error?: string } {
  try {
    const dbPath = getDbPath()
    if (!fs.existsSync(dbPath)) {
      return { success: false, path: '', error: '数据库文件不存在' }
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(getBackupDir(), `panorama-${timestamp}.db`)
    fs.copyFileSync(dbPath, backupPath)
    return { success: true, path: backupPath }
  } catch (e) {
    return { success: false, path: '', error: String(e) }
  }
}

export function restoreBackup(backupPath: string): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: '备份文件不存在' }
    }
    const dbPath = getDbPath()
    // Close current connection before restoring
    const db = getSqlite()
    db.close()
    fs.copyFileSync(backupPath, dbPath)
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function listBackups(): { name: string; path: string; size: number; date: string }[] {
  const dir = getBackupDir()
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const fullPath = path.join(dir, f)
      const stat = fs.statSync(fullPath)
      return {
        name: f,
        path: fullPath,
        size: stat.size,
        date: stat.mtime.toISOString(),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function deleteBackup(backupPath: string): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: '备份文件不存在' }
    }
    fs.unlinkSync(backupPath)
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function exportToJson(): { success: boolean; data?: string; error?: string } {
  try {
    const db = getSqlite()
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]
    const data: Record<string, unknown[]> = {}
    for (const { name } of tables) {
      data[name] = db.prepare(`SELECT * FROM ${name}`).all()
    }
    return { success: true, data: JSON.stringify(data, null, 2) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function importFromJson(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData) as Record<string, unknown[]>
    const db = getSqlite()
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows) || rows.length === 0) continue
      const columns = Object.keys(rows[0] as object)
      const placeholders = columns.map(() => '?').join(', ')
      const insert = db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`)
      for (const row of rows) {
        insert.run(...columns.map((c) => (row as Record<string, unknown>)[c]))
      }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
