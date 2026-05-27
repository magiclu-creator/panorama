import { useEffect, useState } from 'react'
import { Typography, Button, Modal, Form, Input, Select, InputNumber, Progress, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useProjectStore } from '../../stores/project.store'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import type { Project } from '../../../shared/types'

const { Title } = Typography

function Projects() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createProject({
        name: values.name, description: values.description,
        priority: values.priority, budget: values.budget,
      })
      message.success('项目创建成功')
      setCreateModalOpen(false)
      form.resetFields()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', render: (t: string) => <a>{t}</a> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, render: (p: string) => ({ low: '低', medium: '中', high: '高', urgent: '紧急' }[p] || p) },
    { title: '进度', dataIndex: 'progress', key: 'progress', width: 150, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '预算', dataIndex: 'budget', key: 'budget', width: 120, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    { title: '操作', key: 'actions', width: 80, render: (_: unknown, r: Project) => (
      <Button type="link" danger size="small" onClick={() => Modal.confirm({ title: '确认删除', onOk: async () => { await deleteProject(r.id); message.success('已删除') } })}>删除</Button>
    )},
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>项目管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>新建项目</Button>
      </div>
      {projects.length === 0 && !loading ? (
        <EmptyState description="暂无项目" actionText="新建项目" onAction={() => setCreateModalOpen(true)} />
      ) : (
        <DataTable<Project> columns={columns} dataSource={projects} rowKey="id" loading={loading} onRefresh={fetchProjects} />
      )}
      <Modal title="新建项目" open={createModalOpen} onOk={handleCreate} onCancel={() => { setCreateModalOpen(false); form.resetFields() }} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input placeholder="输入项目名称" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} placeholder="输入项目描述（可选）" /></Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium"><Select options={[{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }, { value: 'urgent', label: '紧急' }]} /></Form.Item>
          <Form.Item name="budget" label="预算 (元)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Projects
