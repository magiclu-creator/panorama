import { useEffect, useState } from 'react'
import { Typography, Button, Modal, Form, Input, Select, Tabs, Descriptions, Tag, message } from 'antd'
import { PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { useCustomerStore } from '../../stores/customer.store'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import type { Customer } from '../../../shared/types'

const { Title } = Typography

function Customers() {
  const { customers, loading, fetchCustomers, createCustomer, deleteCustomer } = useCustomerStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createCustomer({
        name: values.name, company: values.company, phone: values.phone,
        email: values.email, type: values.type, status: values.status, source: values.source,
      })
      message.success('客户添加成功')
      setCreateModalOpen(false)
      form.resetFields()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', render: (t: string, r: Customer) => <a onClick={() => { setSelectedCustomer(r); setDetailOpen(true) }}>{t}</a> },
    { title: '公司', dataIndex: 'company', key: 'company', render: (t?: string) => t || '-' },
    { title: '电话', dataIndex: 'phone', key: 'phone', render: (t?: string) => t || '-' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (t: string) => ({ residential: '住宅', commercial: '商业', industrial: '工业', government: '政府' }[t] || t) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <StatusBadge status={s} /> },
    { title: '操作', key: 'actions', width: 80, render: (_: unknown, r: Customer) => (
      <Button type="link" danger size="small" onClick={() => Modal.confirm({ title: '确认删除', content: `确定删除客户"${r.name}"?`, onOk: async () => { await deleteCustomer(r.id); message.success('已删除') } })}>删除</Button>
    )},
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>客户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>添加客户</Button>
      </div>
      {customers.length === 0 && !loading ? (
        <EmptyState description="暂无客户记录" actionText="添加客户" onAction={() => setCreateModalOpen(true)} />
      ) : (
        <DataTable<Customer> columns={columns} dataSource={customers} rowKey="id" loading={loading} onRefresh={fetchCustomers} searchPlaceholder="搜索客户..." />
      )}

      {/* Customer Detail Drawer */}
      <Modal title="客户详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {selectedCustomer && (
          <Tabs items={[
            { key: 'info', label: '基本信息', children: (
              <Descriptions column={2}>
                <Descriptions.Item label="姓名">{selectedCustomer.name}</Descriptions.Item>
                <Descriptions.Item label="公司">{selectedCustomer.company || '-'}</Descriptions.Item>
                <Descriptions.Item label="电话"><PhoneOutlined /> {selectedCustomer.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="邮箱"><MailOutlined /> {selectedCustomer.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="类型"><Tag>{selectedCustomer.type}</Tag></Descriptions.Item>
                <Descriptions.Item label="状态"><StatusBadge status={selectedCustomer.status} /></Descriptions.Item>
                <Descriptions.Item label="来源">{selectedCustomer.source}</Descriptions.Item>
                <Descriptions.Item label="AI 评分">{selectedCustomer.aiScore}</Descriptions.Item>
                {selectedCustomer.notes && <Descriptions.Item label="备注" span={2}>{selectedCustomer.notes}</Descriptions.Item>}
              </Descriptions>
            )},
            { key: 'communication', label: '沟通记录', children: (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                暂无沟通记录
              </div>
            )},
            { key: 'projects', label: '关联项目', children: (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                暂无关联项目
              </div>
            )},
          ]} />
        )}
      </Modal>

      {/* Create Customer Modal */}
      <Modal title="添加客户" open={createModalOpen} onOk={handleCreate} onCancel={() => { setCreateModalOpen(false); form.resetFields() }} okText="添加" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="客户姓名" rules={[{ required: true, message: '请输入客户姓名' }]}><Input placeholder="输入客户姓名" /></Form.Item>
          <Form.Item name="company" label="公司"><Input placeholder="输入公司名称（可选）" /></Form.Item>
          <Form.Item name="phone" label="电话"><Input placeholder="输入电话号码（可选）" /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input placeholder="输入邮箱（可选）" /></Form.Item>
          <Form.Item name="type" label="客户类型" initialValue="residential"><Select options={[{ value: 'residential', label: '住宅' }, { value: 'commercial', label: '商业' }, { value: 'industrial', label: '工业' }, { value: 'government', label: '政府' }]} /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="lead"><Select options={[{ value: 'lead', label: '线索' }, { value: 'prospect', label: '潜在客户' }, { value: 'active', label: '活跃' }, { value: 'inactive', label: '不活跃' }]} /></Form.Item>
          <Form.Item name="source" label="来源" initialValue="other"><Select options={[{ value: 'referral', label: '转介绍' }, { value: 'website', label: '网站' }, { value: 'cold_call', label: '电话销售' }, { value: 'exhibition', label: '展会' }, { value: 'other', label: '其他' }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Customers
