import { Drawer, Descriptions, Tag, Space, Button, Select, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTaskStore } from '../../stores/task.store'
import type { Task, TaskStatus, TaskPriority } from '../../../shared/types'

interface TaskDetailProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

function TaskDetail({ task, open, onClose }: TaskDetailProps) {
  const { updateTaskRemote, deleteTask } = useTaskStore()

  if (!task) return null

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTaskRemote(task.id, {
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    })
    message.success('状态已更新')
  }

  const handlePriorityChange = async (priority: TaskPriority) => {
    await updateTaskRemote(task.id, { priority })
    message.success('优先级已更新')
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    message.success('任务已删除')
    onClose()
  }

  return (
    <Drawer
      title={task.title}
      open={open}
      onClose={onClose}
      width={480}
      extra={
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
          删除
        </Button>
      }
    >
      <Descriptions column={1} labelStyle={{ width: 100 }}>
        <Descriptions.Item label="状态">
          <Select
            value={task.status}
            options={statusOptions}
            onChange={handleStatusChange}
            style={{ width: 140 }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="优先级">
          <Select
            value={task.priority}
            options={priorityOptions}
            onChange={handlePriorityChange}
            style={{ width: 140 }}
          />
        </Descriptions.Item>
        {task.description && (
          <Descriptions.Item label="描述">
            {task.description}
          </Descriptions.Item>
        )}
        {task.dueDate && (
          <Descriptions.Item label="截止日期">
            {new Date(task.dueDate).toLocaleDateString('zh-CN')}
          </Descriptions.Item>
        )}
        {task.completedAt && (
          <Descriptions.Item label="完成时间">
            {new Date(task.completedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="创建时间">
          {new Date(task.createdAt).toLocaleString('zh-CN')}
        </Descriptions.Item>
        {task.tags.length > 0 && (
          <Descriptions.Item label="标签">
            <Space>
              {task.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Drawer>
  )
}

export default TaskDetail
