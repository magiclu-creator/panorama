import { useEffect, useState, useMemo } from 'react'
import { Typography, Button, Modal, Form, Input, Select, InputNumber, DatePicker, Card, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useFinanceStore } from '../../stores/finance.store'
import DataTable from '../../components/common/DataTable'
import BarChart from '../../components/charts/BarChart'
import PieChart from '../../components/charts/PieChart'
import type { Transaction } from '../../../shared/types'

const { Title } = Typography

function Finance() {
  const { transactions, loading, fetchTransactions, createTransaction, deleteTransaction } = useFinanceStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Monthly aggregation for chart
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const t of transactions) {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = map.get(key) || { income: 0, expense: 0 }
      if (t.type === 'income') entry.income += t.amount
      else entry.expense += t.amount
      map.set(key, entry)
    }
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12)
    return {
      months: sorted.map(([k]) => k),
      income: sorted.map(([, v]) => v.income),
      expense: sorted.map(([, v]) => v.expense),
    }
  }, [transactions])

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions.filter((t) => t.type === 'expense')) {
      const cat = t.category || '其他'
      map.set(cat, (map.get(cat) || 0) + t.amount)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createTransaction({
        type: values.type, amount: values.amount,
        category: values.category, description: values.description,
        date: values.date.toISOString(), paymentMethod: values.paymentMethod,
      })
      message.success('记录添加成功')
      setCreateModalOpen(false)
      form.resetFields()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (t: string) => t === 'income' ? <span style={{ color: '#52c41a' }}>收入</span> : <span style={{ color: '#ff4d4f' }}>支出</span> },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number, r: Transaction) => <span style={{ color: r.type === 'income' ? '#52c41a' : '#ff4d4f' }}>{r.type === 'income' ? '+' : '-'}¥{v.toLocaleString()}</span> },
    { title: '类别', dataIndex: 'category', key: 'category', width: 100, render: (t?: string) => t || '-' },
    { title: '描述', dataIndex: 'description', key: 'description', render: (t?: string) => t || '-' },
    { title: '日期', dataIndex: 'date', key: 'date', width: 120, render: (d: string) => new Date(d).toLocaleDateString('zh-CN') },
    { title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100, render: (m: string) => ({ cash: '现金', bank: '银行', wechat: '微信', alipay: '支付宝' }[m] || m) },
    { title: '操作', key: 'actions', width: 80, render: (_: unknown, r: Transaction) => (
      <Button type="link" danger size="small" onClick={() => Modal.confirm({ title: '确认删除', onOk: async () => { await deleteTransaction(r.id); message.success('已删除') } })}>删除</Button>
    )},
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>财务管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>记录收支</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card><Statistic title="总收入" value={totalIncome} prefix="¥" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="总支出" value={totalExpense} prefix="¥" valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="净利润" value={totalIncome - totalExpense} prefix="¥" valueStyle={{ color: totalIncome - totalExpense >= 0 ? '#52c41a' : '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      {/* Charts */}
      {transactions.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={14}>
            <Card title="月度收支趋势">
              <BarChart
                xData={monthlyData.months}
                series={[
                  { name: '收入', data: monthlyData.income, color: '#52c41a' },
                  { name: '支出', data: monthlyData.expense, color: '#ff4d4f' },
                ]}
                height={280}
                yAxisName="金额 (元)"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="支出分类">
              {categoryData.length > 0 ? (
                <PieChart data={categoryData} height={280} />
              ) : (
                <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>暂无支出数据</div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card title="交易记录">
        <DataTable<Transaction> columns={columns} dataSource={transactions} rowKey="id" loading={loading} onRefresh={fetchTransactions} />
      </Card>

      <Modal title="记录收支" open={createModalOpen} onOk={handleCreate} onCancel={() => { setCreateModalOpen(false); form.resetFields() }} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}><Select options={[{ value: 'income', label: '收入' }, { value: 'expense', label: '支出' }]} /></Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
          <Form.Item name="category" label="类别"><Select options={[{ value: '材料', label: '材料' }, { value: '人工', label: '人工' }, { value: '设备', label: '设备' }, { value: '差旅', label: '差旅' }, { value: '办公', label: '办公' }, { value: '其他', label: '其他' }]} /></Form.Item>
          <Form.Item name="description" label="描述"><Input placeholder="输入描述" /></Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="paymentMethod" label="支付方式" initialValue="bank"><Select options={[{ value: 'cash', label: '现金' }, { value: 'bank', label: '银行' }, { value: 'wechat', label: '微信' }, { value: 'alipay', label: '支付宝' }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Finance
