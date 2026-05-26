import { Notification } from 'electron'

export function showNotification(title: string, body: string): void {
  if (!Notification.isSupported()) return
  const notification = new Notification({ title, body })
  notification.show()
}

export function showTaskReminder(title: string, dueDate: string): void {
  showNotification('任务提醒', `${title} 将于 ${dueDate} 到期`)
}

export function showSyncComplete(): void {
  showNotification('同步完成', '数据已成功同步到云端')
}

export function showSyncError(error: string): void {
  showNotification('同步失败', error)
}

export function showBackupComplete(path: string): void {
  showNotification('备份完成', `已备份到: ${path}`)
}
