import { useEffect, useState } from 'react'
import { Typography, Button, Space, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { useTaskStore } from '../../stores/task.store'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import TaskBoard from './TaskBoard'
import TaskDetail from './TaskDetail'
import type { Task, TaskStatus, TaskPriority } from '../../../shared/types'

const { Title } = Typography

function Tasks() {
  const { tasks, loading, fetchTasks, createTask, deleteTask } = useTaskStore()
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createTask({
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate?.toISOString(),
        status: 'pending',
      })
      message.success('任务创建成功')
      setCreateModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      onOk: async () => {
        await deleteTask(id)
        message.success('任务已删除')
      },
    })
  }

  const handleRowClick = (task: Task) => {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => <StatusBadge status={status} />,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: TaskPriority) => {
        const colors: Record<string, string> = { low: '#8c8c8c', medium: '#1890ff', high: '#faad14', urgent: '#ff4d4f' }
        const labels: Record<string, string> = { low: '低', medium: '中', high: '高', urgent: '紧急' }
        return <span style={{ color: colors[priority] }}>{labels[priority]}</span>
      },
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date?: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Task) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>任务管理</Title>
        <Space>
          <Button icon={<UnorderedListOutlined />} type={viewMode === 'list' ? 'primary' : 'default'} onClick={() => setViewMode('list')}>列表</Button>
          <Button icon={<AppstoreOutlined />} type={viewMode === 'board' ? 'primary' : 'default'} onClick={() => setViewMode('board')}>看板</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>新建任务</Button>
        </Space>
      </div>

      {viewMode === 'list' ? (
        tasks.length === 0 && !loading ? (
          <EmptyState description="暂无任务" actionText="新建任务" onAction={() => setCreateModalOpen(true)} />
        ) : (
          <DataTable<Task> columns={columns} dataSource={tasks} rowKey="id" loading={loading} onRefresh={fetchTasks} searchPlaceholder="搜索任务..." />
        )
      ) : (
        <TaskBoard />
      )}

      <TaskDetail task={selectedTask} open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedTask(null) }} />

      <Modal title="新建任务" open={createModalOpen} onOk={handleCreate} onCancel={() => { setCreateModalOpen(false); form.resetFields() }} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
            <Input placeholder="输入任务标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="输入任务描述（可选）" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select options={[{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }, { value: 'urgent', label: '紧急' }]} />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tasks
