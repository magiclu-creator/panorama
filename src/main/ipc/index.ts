import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import { logger } from '../utils/logger'
import { IPC_CHANNELS } from '../../shared/constants'
import * as backupService from '../services/backup.service'
import * as syncService from '../services/sync.service'
import * as notificationService from '../services/notification.service'

// Helper: safe JSON parse
function safeJsonParse(str: unknown, fallback: unknown = []): unknown {
  if (typeof str !== 'string') return str ?? fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function registerAllIpcHandlers(): void {
  logger.info('Registering IPC handlers...')

  registerAppHandlers()
  registerTaskHandlers()
  registerEventHandlers()
  registerCustomerHandlers()
  registerProjectHandlers()
  registerFinanceHandlers()
  registerSolarHandlers()
  registerLifeHandlers()
  registerAiHandlers()
  registerFileHandlers()
  registerBackupHandlers()
  registerSyncHandlers()

  logger.info('All IPC handlers registered')
}

function registerAppHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, () => {
    return '0.1.0'
  })

  ipcMain.handle(IPC_CHANNELS.APP.GET_SETTINGS, async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      const rows = getSqlite().prepare('SELECT * FROM app_settings').all()
      const settings: Record<string, unknown> = {}
      for (const row of rows as Array<{ key: string; value: string }>) {
        settings[row.key] = safeJsonParse(row.value, {})
      }
      return settings
    } catch (error) {
      logger.error('Failed to get settings', error)
      return {}
    }
  })

  ipcMain.handle(IPC_CHANNELS.APP.SET_SETTING, async (_event, key: string, value: unknown) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare(
        'INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).run(key, JSON.stringify(value))
      return { success: true }
    } catch (error) {
      logger.error('Failed to set setting', error)
      throw error
    }
  })
}

function registerTaskHandlers(): void {
  ipcMain.handle('tasks:list', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list tasks', error)
      return []
    }
  })

  ipcMain.handle('tasks:get', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to get task', error)
      return null
    }
  })

  ipcMain.handle('tasks:create', async (_event, task: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO tasks (id, title, description, status, priority, due_date, is_recurring, recurrence_rule, parent_task_id, project_id, customer_id, tags, ai_classified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        task.title,
        task.description || null,
        task.status || 'pending',
        task.priority || 'medium',
        task.dueDate || null,
        task.isRecurring ? 1 : 0,
        task.recurrenceRule || null,
        task.parentTaskId || null,
        task.projectId || null,
        task.customerId || null,
        JSON.stringify(task.tags || []),
        task.aiClassified ? 1 : 0,
        now,
        now
      )
      // Return the row from DB (snake_case)
      return getSqlite().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create task', error)
      throw error
    }
  })

  ipcMain.handle('tasks:update', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []

      if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
      if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority) }
      if (updates.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updates.dueDate) }
      if (updates.isRecurring !== undefined) { fields.push('is_recurring = ?'); values.push(updates.isRecurring ? 1 : 0) }
      if (updates.recurrenceRule !== undefined) { fields.push('recurrence_rule = ?'); values.push(updates.recurrenceRule) }
      if (updates.parentTaskId !== undefined) { fields.push('parent_task_id = ?'); values.push(updates.parentTaskId) }
      if (updates.projectId !== undefined) { fields.push('project_id = ?'); values.push(updates.projectId) }
      if (updates.customerId !== undefined) { fields.push('customer_id = ?'); values.push(updates.customerId) }
      if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
      if (updates.completedAt !== undefined) { fields.push('completed_at = ?'); values.push(updates.completedAt) }

      fields.push('updated_at = ?')
      values.push(now)
      values.push(id)

      getSqlite().prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update task', error)
      throw error
    }
  })

  ipcMain.handle('tasks:delete', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM tasks WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete task', error)
      throw error
    }
  })

  ipcMain.handle('tasks:search', async (_event, query: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare(
        'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC'
      ).all(`%${query}%`, `%${query}%`)
    } catch (error) {
      logger.error('Failed to search tasks', error)
      return []
    }
  })
}

function registerEventHandlers(): void {
  ipcMain.handle('events:list', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM events ORDER BY start_time DESC').all()
    } catch (error) {
      logger.error('Failed to list events', error)
      return []
    }
  })

  ipcMain.handle('events:get', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM events WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to get event', error)
      return null
    }
  })

  ipcMain.handle('events:create', async (_event, event: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO events (id, title, description, start_time, end_time, all_day, location, color, recurrence_rule, task_id, customer_id, project_id, reminders, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, event.title, event.description || null,
        event.startTime, event.endTime, event.allDay ? 1 : 0,
        event.location || null, event.color || null,
        event.recurrenceRule || null, event.taskId || null,
        event.customerId || null, event.projectId || null,
        JSON.stringify(event.reminders || []),
        now, now
      )
      return getSqlite().prepare('SELECT * FROM events WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create event', error)
      throw error
    }
  })

  ipcMain.handle('events:update', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
      if (updates.startTime !== undefined) { fields.push('start_time = ?'); values.push(updates.startTime) }
      if (updates.endTime !== undefined) { fields.push('end_time = ?'); values.push(updates.endTime) }
      if (updates.allDay !== undefined) { fields.push('all_day = ?'); values.push(updates.allDay ? 1 : 0) }
      if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location) }
      if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color) }
      if (updates.reminders !== undefined) { fields.push('reminders = ?'); values.push(JSON.stringify(updates.reminders)) }
      fields.push('updated_at = ?'); values.push(now); values.push(id)
      getSqlite().prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM events WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update event', error)
      throw error
    }
  })

  ipcMain.handle('events:delete', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM events WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete event', error)
      throw error
    }
  })
}

function registerCustomerHandlers(): void {
  ipcMain.handle('customers:list', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM customers ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list customers', error)
      return []
    }
  })

  ipcMain.handle('customers:get', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM customers WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to get customer', error)
      return null
    }
  })

  ipcMain.handle('customers:create', async (_event, customer: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO customers (id, name, company, phone, email, address, type, status, source, tags, notes, ai_score, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, customer.name, customer.company || null,
        customer.phone || null, customer.email || null, customer.address || null,
        customer.type || 'residential', customer.status || 'lead',
        customer.source || 'other', JSON.stringify(customer.tags || []),
        customer.notes || null, customer.aiScore || 0, now, now
      )
      return getSqlite().prepare('SELECT * FROM customers WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create customer', error)
      throw error
    }
  })

  ipcMain.handle('customers:update', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
      if (updates.company !== undefined) { fields.push('company = ?'); values.push(updates.company) }
      if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone) }
      if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email) }
      if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address) }
      if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type) }
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
      if (updates.source !== undefined) { fields.push('source = ?'); values.push(updates.source) }
      if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
      if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes) }
      if (updates.aiScore !== undefined) { fields.push('ai_score = ?'); values.push(updates.aiScore) }
      fields.push('updated_at = ?'); values.push(now); values.push(id)
      getSqlite().prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM customers WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update customer', error)
      throw error
    }
  })

  ipcMain.handle('customers:delete', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM customers WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete customer', error)
      throw error
    }
  })

  ipcMain.handle('customers:search', async (_event, query: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare(
        'SELECT * FROM customers WHERE name LIKE ? OR company LIKE ? OR phone LIKE ? ORDER BY created_at DESC'
      ).all(`%${query}%`, `%${query}%`, `%${query}%`)
    } catch (error) {
      logger.error('Failed to search customers', error)
      return []
    }
  })
}

function registerProjectHandlers(): void {
  ipcMain.handle('projects:list', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM projects ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list projects', error)
      return []
    }
  })

  ipcMain.handle('projects:get', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to get project', error)
      return null
    }
  })

  ipcMain.handle('projects:create', async (_event, project: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, spent, progress, customer_id, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, project.name, project.description || null,
        project.status || 'planning', project.priority || 'medium',
        project.startDate || null, project.endDate || null,
        project.budget || 0, project.spent || 0, project.progress || 0,
        project.customerId || null, JSON.stringify(project.tags || []),
        now, now
      )
      return getSqlite().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create project', error)
      throw error
    }
  })

  ipcMain.handle('projects:update', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
      if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority) }
      if (updates.startDate !== undefined) { fields.push('start_date = ?'); values.push(updates.startDate) }
      if (updates.endDate !== undefined) { fields.push('end_date = ?'); values.push(updates.endDate) }
      if (updates.budget !== undefined) { fields.push('budget = ?'); values.push(updates.budget) }
      if (updates.spent !== undefined) { fields.push('spent = ?'); values.push(updates.spent) }
      if (updates.progress !== undefined) { fields.push('progress = ?'); values.push(updates.progress) }
      if (updates.customerId !== undefined) { fields.push('customer_id = ?'); values.push(updates.customerId) }
      if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
      fields.push('updated_at = ?'); values.push(now); values.push(id)
      getSqlite().prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update project', error)
      throw error
    }
  })

  ipcMain.handle('projects:delete', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM projects WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete project', error)
      throw error
    }
  })

  ipcMain.handle('projects:search', async (_event, query: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare(
        'SELECT * FROM projects WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC'
      ).all(`%${query}%`, `%${query}%`)
    } catch (error) {
      logger.error('Failed to search projects', error)
      return []
    }
  })
}

function registerFinanceHandlers(): void {
  ipcMain.handle('finance:listTransactions', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM transactions ORDER BY date DESC').all()
    } catch (error) {
      logger.error('Failed to list transactions', error)
      return []
    }
  })

  ipcMain.handle('finance:createTransaction', async (_event, tx: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO transactions (id, type, amount, category, subcategory, description, date, project_id, customer_id, invoice_id, payment_method, receipt_path, ai_classified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, tx.type, tx.amount, tx.category || null,
        tx.subcategory || null, tx.description || null,
        tx.date, tx.projectId || null, tx.customerId || null,
        tx.invoiceId || null, tx.paymentMethod || 'bank',
        tx.receiptPath || null, tx.aiClassified ? 1 : 0, now, now
      )
      return getSqlite().prepare('SELECT * FROM transactions WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create transaction', error)
      throw error
    }
  })

  ipcMain.handle('finance:updateTransaction', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type) }
      if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount) }
      if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category) }
      if (updates.subcategory !== undefined) { fields.push('subcategory = ?'); values.push(updates.subcategory) }
      if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
      if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date) }
      if (updates.paymentMethod !== undefined) { fields.push('payment_method = ?'); values.push(updates.paymentMethod) }
      if (updates.projectId !== undefined) { fields.push('project_id = ?'); values.push(updates.projectId) }
      if (updates.customerId !== undefined) { fields.push('customer_id = ?'); values.push(updates.customerId) }
      if (updates.invoiceId !== undefined) { fields.push('invoice_id = ?'); values.push(updates.invoiceId) }
      if (updates.receiptPath !== undefined) { fields.push('receipt_path = ?'); values.push(updates.receiptPath) }
      fields.push('updated_at = ?'); values.push(now); values.push(id)
      getSqlite().prepare(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM transactions WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update transaction', error)
      throw error
    }
  })

  ipcMain.handle('finance:deleteTransaction', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM transactions WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete transaction', error)
      throw error
    }
  })

  ipcMain.handle('finance:listInvoices', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM invoices ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list invoices', error)
      return []
    }
  })

  ipcMain.handle('finance:createInvoice', async (_event, invoice: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO invoices (id, invoice_no, customer_id, project_id, amount, tax, status, issued_date, due_date, paid_date, items, file_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, invoice.invoiceNo, invoice.customerId || null,
        invoice.projectId || null, invoice.amount, invoice.tax || 0,
        invoice.status || 'draft', invoice.issuedDate || null,
        invoice.dueDate || null, invoice.paidDate || null,
        JSON.stringify(invoice.items || []), invoice.filePath || null, now, now
      )
      return getSqlite().prepare('SELECT * FROM invoices WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create invoice', error)
      throw error
    }
  })
}

function registerSolarHandlers(): void {
  ipcMain.handle('solar:list', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM solar_projects ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list solar projects', error)
      return []
    }
  })

  ipcMain.handle('solar:get', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM solar_projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to get solar project', error)
      return null
    }
  })

  ipcMain.handle('solar:create', async (_event, project: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        `INSERT INTO solar_projects (id, project_id, customer_id, project_name, system_type, capacity, panel_count, panel_model, inverter_model, mounting_type, roof_area, roof_orientation, roof_tilt, latitude, longitude, address, stage, stage_history, contract_amount, estimated_generation, actual_generation, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, project.projectId || null, project.customerId || null,
        project.projectName, project.systemType || 'grid_tied',
        project.capacity || 0, project.panelCount || 0,
        project.panelModel || null, project.inverterModel || null,
        project.mountingType || 'roof', project.roofArea || null,
        project.roofOrientation || null, project.roofTilt || null,
        project.latitude || null, project.longitude || null,
        project.address || null, project.stage || 'survey',
        JSON.stringify([]), project.contractAmount || 0,
        project.estimatedGeneration || 0, 0,
        project.notes || null, now, now
      )
      return getSqlite().prepare('SELECT * FROM solar_projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to create solar project', error)
      throw error
    }
  })

  ipcMain.handle('solar:update', async (_event, id: string, updates: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const fields: string[] = []
      const values: unknown[] = []
      if (updates.projectName !== undefined) { fields.push('project_name = ?'); values.push(updates.projectName) }
      if (updates.systemType !== undefined) { fields.push('system_type = ?'); values.push(updates.systemType) }
      if (updates.capacity !== undefined) { fields.push('capacity = ?'); values.push(updates.capacity) }
      if (updates.panelCount !== undefined) { fields.push('panel_count = ?'); values.push(updates.panelCount) }
      if (updates.panelModel !== undefined) { fields.push('panel_model = ?'); values.push(updates.panelModel) }
      if (updates.inverterModel !== undefined) { fields.push('inverter_model = ?'); values.push(updates.inverterModel) }
      if (updates.mountingType !== undefined) { fields.push('mounting_type = ?'); values.push(updates.mountingType) }
      if (updates.roofArea !== undefined) { fields.push('roof_area = ?'); values.push(updates.roofArea) }
      if (updates.roofOrientation !== undefined) { fields.push('roof_orientation = ?'); values.push(updates.roofOrientation) }
      if (updates.roofTilt !== undefined) { fields.push('roof_tilt = ?'); values.push(updates.roofTilt) }
      if (updates.latitude !== undefined) { fields.push('latitude = ?'); values.push(updates.latitude) }
      if (updates.longitude !== undefined) { fields.push('longitude = ?'); values.push(updates.longitude) }
      if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address) }
      if (updates.stage !== undefined) { fields.push('stage = ?'); values.push(updates.stage) }
      if (updates.contractAmount !== undefined) { fields.push('contract_amount = ?'); values.push(updates.contractAmount) }
      if (updates.estimatedGeneration !== undefined) { fields.push('estimated_generation = ?'); values.push(updates.estimatedGeneration) }
      if (updates.actualGeneration !== undefined) { fields.push('actual_generation = ?'); values.push(updates.actualGeneration) }
      if (updates.commissioningDate !== undefined) { fields.push('commissioning_date = ?'); values.push(updates.commissioningDate) }
      if (updates.acceptanceDate !== undefined) { fields.push('acceptance_date = ?'); values.push(updates.acceptanceDate) }
      if (updates.warrantyExpiry !== undefined) { fields.push('warranty_expiry = ?'); values.push(updates.warrantyExpiry) }
      if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes) }
      fields.push('updated_at = ?'); values.push(now); values.push(id)
      getSqlite().prepare(`UPDATE solar_projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return getSqlite().prepare('SELECT * FROM solar_projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update solar project', error)
      throw error
    }
  })

  ipcMain.handle('solar:updateStage', async (_event, id: string, stage: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const now = new Date().toISOString()
      const row = getSqlite().prepare('SELECT stage_history FROM solar_projects WHERE id = ?').get(id) as { stage_history: string } | undefined
      const history = row ? safeJsonParse(row.stage_history, []) as Array<Record<string, unknown>> : []
      if (history.length > 0 && !history[history.length - 1]!.exitedAt) {
        history[history.length - 1]!.exitedAt = now
      }
      history.push({ stage, enteredAt: now })
      getSqlite().prepare('UPDATE solar_projects SET stage = ?, stage_history = ?, updated_at = ? WHERE id = ?')
        .run(stage, JSON.stringify(history), now, id)
      return getSqlite().prepare('SELECT * FROM solar_projects WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to update solar stage', error)
      throw error
    }
  })

  ipcMain.handle('solar:delete', async (_event, id: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      getSqlite().prepare('DELETE FROM solar_projects WHERE id = ?').run(id)
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete solar project', error)
      throw error
    }
  })

  ipcMain.handle('solar:addGeneration', async (_event, data: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      getSqlite().prepare(
        'INSERT OR REPLACE INTO solar_generation (id, solar_project_id, date, kwh, peak_power, sunshine_hours, weather, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, data.solarProjectId, data.date, data.kWh, data.peakPower || null, data.sunshineHours || null, data.weather || null, data.notes || null)
      return getSqlite().prepare('SELECT * FROM solar_generation WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to add generation data', error)
      throw error
    }
  })

  ipcMain.handle('solar:getGeneration', async (_event, solarProjectId: string) => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM solar_generation WHERE solar_project_id = ? ORDER BY date DESC').all(solarProjectId)
    } catch (error) {
      logger.error('Failed to get generation data', error)
      return []
    }
  })
}

function registerLifeHandlers(): void {
  ipcMain.handle('life:listHealth', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM health_records ORDER BY date DESC').all()
    } catch (error) {
      logger.error('Failed to list health records', error)
      return []
    }
  })

  ipcMain.handle('life:addHealth', async (_event, record: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        'INSERT INTO health_records (id, date, type, value, unit, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, record.date, record.type, record.value, record.unit || null, record.notes || null, now)
      return getSqlite().prepare('SELECT * FROM health_records WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to add health record', error)
      throw error
    }
  })

  ipcMain.handle('life:listHabits', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list habits', error)
      return []
    }
  })

  ipcMain.handle('life:logHabit', async (_event, data: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      getSqlite().prepare(
        'INSERT INTO habit_logs (id, habit_id, date, count, notes) VALUES (?, ?, ?, ?, ?)'
      ).run(id, data.habitId, data.date, data.count || 1, data.notes || null)
      return getSqlite().prepare('SELECT * FROM habit_logs WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to log habit', error)
      throw error
    }
  })

  ipcMain.handle('life:listGoals', async () => {
    try {
      const { getSqlite } = await import('../database/connection')
      return getSqlite().prepare('SELECT * FROM learning_goals ORDER BY created_at DESC').all()
    } catch (error) {
      logger.error('Failed to list learning goals', error)
      return []
    }
  })

  ipcMain.handle('life:addJournal', async (_event, entry: Record<string, unknown>) => {
    try {
      const { getSqlite } = await import('../database/connection')
      const { v4: uuidv4 } = await import('uuid')
      const id = uuidv4()
      const now = new Date().toISOString()
      getSqlite().prepare(
        'INSERT INTO journal_entries (id, date, title, content, mood, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, entry.date, entry.title || null, entry.content, entry.mood || null, JSON.stringify(entry.tags || []), now, now)
      return getSqlite().prepare('SELECT * FROM journal_entries WHERE id = ?').get(id)
    } catch (error) {
      logger.error('Failed to add journal entry', error)
      throw error
    }
  })
}

function registerAiHandlers(): void {
  ipcMain.handle('ai:chat', async (_event, messages: Array<{ role: 'user' | 'assistant'; content: string }>, _options?: unknown) => {
    try {
      const ai = await import('../services/ai.service')
      if (!ai.isConfigured()) {
        return { role: 'assistant', content: '请先在设置中配置 Anthropic API Key 以启用 AI 功能。' }
      }
      return await ai.chat(messages)
    } catch (error) {
      logger.error('AI chat error', error)
      return { role: 'assistant', content: 'AI 请求失败，请检查 API Key 和网络连接。' }
    }
  })

  ipcMain.handle('ai:classify', async (_event, text: string, type: string) => {
    try {
      const ai = await import('../services/ai.service')
      return await ai.classify(text, type as 'task_priority' | 'customer_type' | 'expense_category')
    } catch (error) {
      logger.error('AI classify error', error)
      return { category: 'general', confidence: 0 }
    }
  })

  ipcMain.handle('ai:parseIntent', async (_event, text: string) => {
    try {
      const ai = await import('../services/ai.service')
      return await ai.parseIntent(text)
    } catch (error) {
      logger.error('AI parseIntent error', error)
      return { intent: 'unknown', entities: {} }
    }
  })

  ipcMain.handle('ai:analyze', async (_event, module: string, data: unknown) => {
    try {
      const ai = await import('../services/ai.service')
      return await ai.analyze(module, data)
    } catch (error) {
      logger.error('AI analyze error', error)
      return { insights: [], suggestions: [] }
    }
  })
}

function registerFileHandlers(): void {
  ipcMain.handle('file:save', async (_event, _file: unknown, _category: string) => {
    logger.info('File save handler called (not yet implemented)')
    return { success: false, message: 'File save will be implemented in Phase 1' }
  })

  ipcMain.handle('file:open', async (_event, _filePath: string) => {
    logger.info('File open handler called (not yet implemented)')
    return { success: false, message: 'File open will be implemented in Phase 1' }
  })

  ipcMain.handle('file:export', async (_event, _module: string, _format: string) => {
    logger.info('File export handler called (not yet implemented)')
    return { success: false, message: 'Export will be implemented in Phase 1' }
  })

  ipcMain.handle('file:import', async (_event, _module: string, _filePath: string) => {
    logger.info('File import handler called (not yet implemented)')
    return { success: false, message: 'Import will be implemented in Phase 1' }
  })
}

function registerBackupHandlers(): void {
  ipcMain.handle('backup:create', async () => {
    logger.info('Creating backup...')
    const result = backupService.createBackup()
    if (result.success) {
      notificationService.showBackupComplete(result.path)
    }
    return result
  })

  ipcMain.handle('backup:list', async () => {
    return backupService.listBackups()
  })

  ipcMain.handle('backup:restore', async (_event, backupPath: string) => {
    logger.info(`Restoring backup from: ${backupPath}`)
    return backupService.restoreBackup(backupPath)
  })

  ipcMain.handle('backup:delete', async (_event, backupPath: string) => {
    return backupService.deleteBackup(backupPath)
  })

  ipcMain.handle('backup:exportJson', async () => {
    const result = backupService.exportToJson()
    if (result.success && result.data) {
      const { filePath } = await dialog.showSaveDialog({
        title: '导出数据',
        defaultPath: 'panorama-export.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (filePath) {
        fs.writeFileSync(filePath, result.data)
        return { success: true, path: filePath }
      }
      return { success: false, error: '已取消' }
    }
    return result
  })

  ipcMain.handle('backup:importJson', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: '导入数据',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (filePaths.length === 0) {
      return { success: false, error: '已取消' }
    }
    const data = fs.readFileSync(filePaths[0]!, 'utf-8')
    return backupService.importFromJson(data)
  })
}

function registerSyncHandlers(): void {
  ipcMain.handle('sync:setDirectory', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择同步目录',
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.filePaths.length === 0) {
      return { success: false, error: '已取消' }
    }
    return syncService.setSyncDirectory(result.filePaths[0]!)
  })

  ipcMain.handle('sync:getDirectory', async () => {
    return syncService.getSyncDirectory()
  })

  ipcMain.handle('sync:upload', async () => {
    logger.info('Syncing to cloud...')
    const result = syncService.syncToCloud()
    if (result.success) {
      notificationService.showSyncComplete()
    } else {
      notificationService.showSyncError(result.error || '未知错误')
    }
    return result
  })

  ipcMain.handle('sync:download', async () => {
    logger.info('Syncing from cloud...')
    return syncService.syncFromCloud()
  })

  ipcMain.handle('sync:status', async () => {
    return syncService.getSyncStatus()
  })

  ipcMain.handle('notification:show', async (_event, title: string, body: string) => {
    notificationService.showNotification(title, body)
  })
}
