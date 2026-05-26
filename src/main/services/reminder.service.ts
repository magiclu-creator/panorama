import { getSqlite } from '../database/connection'
import { showTaskReminder } from './notification.service'
import { logger } from '../utils/logger'

let reminderInterval: ReturnType<typeof setInterval> | null = null
const sentReminders = new Set<string>()

export function startReminderEngine(): void {
  if (reminderInterval) return
  logger.info('Starting reminder engine')

  // Check every 60 seconds
  reminderInterval = setInterval(() => {
    checkDueTasks()
  }, 60 * 1000)

  // Also check immediately
  checkDueTasks()
}

export function stopReminderEngine(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
    logger.info('Reminder engine stopped')
  }
}

function checkDueTasks(): void {
  try {
    const db = getSqlite()
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

    // Find tasks due within the next hour or overdue, that are still pending/in_progress
    const tasks = db.prepare(`
      SELECT id, title, due_date, status, priority
      FROM tasks
      WHERE status IN ('pending', 'in_progress')
        AND due_date IS NOT NULL
        AND due_date != ''
        AND (
          datetime(due_date) <= datetime(?)
          OR (datetime(due_date) <= datetime(?) AND datetime(due_date) > datetime(?))
        )
    `).all(
      now.toISOString(),
      oneHourLater.toISOString(),
      now.toISOString()
    ) as Array<{ id: string; title: string; due_date: string; status: string; priority: string }>

    for (const task of tasks) {
      const reminderKey = `${task.id}-${task.due_date}`
      if (sentReminders.has(reminderKey)) continue

      const dueDate = new Date(task.due_date)
      const isOverdue = dueDate < now
      const title = isOverdue ? `任务已过期: ${task.title}` : `任务即将到期: ${task.title}`
      const dueDateStr = dueDate.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })

      showTaskReminder(title, dueDateStr)
      sentReminders.add(reminderKey)
      logger.info(`Reminder sent for task: ${task.title}`)
    }

    // Clean up old reminders (older than 24 hours)
    if (sentReminders.size > 1000) {
      sentReminders.clear()
    }
  } catch (e) {
    logger.error('Reminder check failed', e)
  }
}
