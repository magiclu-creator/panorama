import fs from 'fs'
import path from 'path'
import { getLogsPath } from './paths'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private logFile: string

  constructor() {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    this.logFile = path.join(getLogsPath(), `panorama-${dateStr}.log`)
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    const formatted = this.formatMessage(level, message, meta)
    fs.appendFileSync(this.logFile, formatted)
    if (level === 'error') {
      console.error(formatted.trim())
    } else if (level === 'warn') {
      console.warn(formatted.trim())
    }
  }

  info(message: string, meta?: unknown): void {
    this.write('info', message, meta)
  }

  warn(message: string, meta?: unknown): void {
    this.write('warn', message, meta)
  }

  error(message: string, meta?: unknown): void {
    this.write('error', message, meta)
  }

  debug(message: string, meta?: unknown): void {
    this.write('debug', message, meta)
  }
}

export const logger = new Logger()
