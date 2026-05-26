import { Card, Tag, Typography, Badge, message } from 'antd'
import { useTaskStore } from '../../stores/task.store'
import type { Task, TaskStatus, TaskPriority } from '../../../shared/types'

const { Text } = Typography

const columns: { key: TaskStatus; title: string; color: string }[] = [
  { key: 'pending', title: '待处理', color: '#8c8c8c' },
  { key: 'in_progress', title: '进行中', color: '#1890ff' },
  { key: 'completed', title: '已完成', color: '#52c41a' },
]

const priorityColors: Record<TaskPriority, string> = {
  low: '#8c8c8c',
  medium: '#1890ff',
  high: '#faad14',
  urgent: '#ff4d4f',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

function TaskCard({ task }: { task: Task }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id)
  }

  return (
    <Card
      size="small"
      draggable
      onDragStart={handleDragStart}
      style={{ marginBottom: 8, cursor: 'grab' }}
      hoverable
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text strong style={{ flex: 1 }}>{task.title}</Text>
        <Tag color={priorityColors[task.priority]} style={{ marginLeft: 8 }}>
          {priorityLabels[task.priority]}
        </Tag>
      </div>
      {task.description && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description}
        </Text>
      )}
      {task.dueDate && (
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            display: 'block',
            marginTop: 4,
            color: new Date(task.dueDate) < new Date() ? '#ff4d4f' : undefined,
          }}
        >
          截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}
        </Text>
      )}
    </Card>
  )
}

function TaskBoard() {
  const { tasks, updateTaskRemote } = useTaskStore()

  const statusLabels: Record<TaskStatus, string> = {
    pending: '待处理', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.status !== targetStatus) {
        await updateTaskRemote(taskId, { status: targetStatus })
        message.success(`已移动到「${statusLabels[targetStatus]}」`)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 220px)', overflow: 'auto' }}>
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key)
        return (
          <div
            key={col.key}
            style={{ flex: 1, minWidth: 280 }}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragOver={handleDragOver}
          >
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: col.color,
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong style={{ color: '#fff' }}>{col.title}</Text>
              <Badge count={columnTasks.length} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </div>
            <div
              style={{
                padding: 12,
                backgroundColor: '#fafafa',
                borderRadius: '0 0 8px 8px',
                minHeight: 200,
              }}
            >
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {columnTasks.length === 0 && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>
                  拖拽任务到此处
                </Text>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskBoard
