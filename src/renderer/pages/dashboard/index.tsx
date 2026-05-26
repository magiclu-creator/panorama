import { useEffect, useState, useCallback, useMemo } from 'react'
import { Typography, Card, Row, Col, Statistic, List, Tag, Button, Space, Empty, Progress, Spin } from 'antd'
import PieChart from '../../components/charts/PieChart'
import {
  CheckCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  SunOutlined,
  PlusOutlined,
  CalendarOutlined,
  DollarOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTaskStore } from '../../stores/task.store'
import { useCustomerStore } from '../../stores/customer.store'
import { useProjectStore } from '../../stores/project.store'
import { useSolarStore } from '../../stores/solar.store'
import { useFinanceStore } from '../../stores/finance.store'

const { Title, Text } = Typography

const priorityColors: Record<string, string> = {
  low: 'default', medium: 'blue', high: 'orange', urgent: 'red',
}

const statusLabels: Record<string, string> = {
  pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
}

function Dashboard() {
  const navigate = useNavigate()
  const { tasks, fetchTasks } = useTaskStore()
  const { customers, fetchCustomers } = useCustomerStore()
  const { projects, fetchProjects } = useProjectStore()
  const { projects: solarProjects, fetchProjects: fetchSolarProjects } = useSolarStore()
  const { transactions, fetchTransactions } = useFinanceStore()

  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchCustomers()
    fetchProjects()
    fetchSolarProjects()
    fetchTransactions()
  }, [fetchTasks, fetchCustomers, fetchProjects, fetchSolarProjects, fetchTransactions])

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const totalCapacity = solarProjects.reduce((sum, p) => sum + p.capacity, 0)

  const now = new Date()
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return d.toDateString() === now.toDateString()
  })

  const taskStatusData = useMemo(() => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '待办', color: '#8c8c8c' },
      in_progress: { label: '进行中', color: '#1890ff' },
      completed: { label: '已完成', color: '#52c41a' },
      cancelled: { label: '已取消', color: '#ff4d4f' },
    }
    const counts = new Map<string, number>()
    for (const t of tasks) {
      counts.set(t.status, (counts.get(t.status) || 0) + 1)
    }
    return [...counts.entries()].map(([status, value]) => ({
      name: statusMap[status]?.label || status,
      value,
      color: statusMap[status]?.color,
    }))
  }, [tasks])

  const fetchAiInsights = useCallback(async () => {
    setAiLoading(true)
    try {
      const summary = {
        tasks: { total: tasks.length, pending: pendingTasks.length, overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length },
        customers: { total: customers.length, active: activeCustomers },
        projects: { total: projects.length, active: activeProjects },
        solar: { count: solarProjects.length, capacity: totalCapacity },
        finance: { monthIncome, monthExpense, profit: monthIncome - monthExpense },
      }
      const result = await window.panorama.ai.analyze('综合', summary) as { insights: string[]; suggestions: string[] }
      setAiInsights(result.insights || [])
      setAiSuggestions(result.suggestions || [])
    } catch {
      // AI not configured or error
    } finally {
      setAiLoading(false)
    }
  }, [tasks, pendingTasks, customers, activeCustomers, projects, activeProjects, solarProjects, totalCapacity, monthIncome, monthExpense, now])

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>仪表盘</Title>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/tasks')}>新建任务</Button>
        </Space>
      </div>

      {/* Stats row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card" hoverable onClick={() => navigate('/tasks')}>
            <Statistic
              title="待办任务"
              value={pendingTasks.length}
              prefix={<CheckCircleOutlined style={{ color: '#FF8C00' }} />}
              valueStyle={{ color: '#FF8C00' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {tasks.filter((t) => t.status === 'in_progress').length} 进行中
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card" hoverable onClick={() => navigate('/customers')}>
            <Statistic
              title="活跃客户"
              value={activeCustomers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {customers.length} 位客户
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card" hoverable onClick={() => navigate('/projects')}>
            <Statistic
              title="进行中项目"
              value={activeProjects}
              prefix={<ProjectOutlined style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {projects.length} 个项目
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card" hoverable onClick={() => navigate('/solar')}>
            <Statistic
              title="光伏装机容量"
              value={totalCapacity}
              suffix="kWp"
              prefix={<SunOutlined style={{ color: '#FAAD14' }} />}
              valueStyle={{ color: '#FAAD14' }}
              precision={1}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {solarProjects.length} 个光伏项目
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Content widgets */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span><CheckCircleOutlined /> 待办任务</span>}
            extra={<Button type="link" size="small" onClick={() => navigate('/tasks')}>查看全部 <ArrowRightOutlined /></Button>}
            style={{ height: 360 }}
            bodyStyle={{ padding: '0 24px', maxHeight: 290, overflowY: 'auto' }}
          >
            {pendingTasks.length === 0 ? (
              <Empty description="暂无待办任务" style={{ paddingTop: 60 }}>
                <Button type="primary" onClick={() => navigate('/tasks')}>创建任务</Button>
              </Empty>
            ) : (
              <List
                dataSource={pendingTasks.slice(0, 8)}
                renderItem={(task) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ flex: 1 }}>
                      <Text>{task.title}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
                        <Tag>{statusLabels[task.status] || task.status}</Tag>
                        {task.dueDate && (
                          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                            {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                          </Text>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span><CalendarOutlined /> 今日日程</span>}
            extra={<Button type="link" size="small" onClick={() => navigate('/calendar')}>查看日历 <ArrowRightOutlined /></Button>}
            style={{ height: 360 }}
            bodyStyle={{ padding: '0 24px', maxHeight: 290, overflowY: 'auto' }}
          >
            {todayTasks.length === 0 ? (
              <Empty description="今日暂无日程" style={{ paddingTop: 60 }}>
                <Button onClick={() => navigate('/calendar')}>查看日历</Button>
              </Empty>
            ) : (
              <List
                dataSource={todayTasks.slice(0, 8)}
                renderItem={(task) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <Text>{task.title}</Text>
                    <Tag>{statusLabels[task.status] || task.status}</Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<span><DollarOutlined /> 本月收支</span>}
            extra={<Button type="link" size="small" onClick={() => navigate('/finance')}>查看财务 <ArrowRightOutlined /></Button>}
            style={{ height: 300 }}
          >
            {monthTransactions.length === 0 ? (
              <Empty description="本月暂无收支记录" style={{ paddingTop: 40 }}>
                <Button onClick={() => navigate('/finance')}>记录收支</Button>
              </Empty>
            ) : (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Statistic title="收入" value={monthIncome} prefix="¥" valueStyle={{ color: '#52c41a', fontSize: 20 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="支出" value={monthExpense} prefix="¥" valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="净利润" value={monthIncome - monthExpense} prefix="¥" valueStyle={{ color: monthIncome - monthExpense >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 20 }} />
                  </Col>
                </Row>
                {monthIncome + monthExpense > 0 && (
                  <div>
                    <Text type="secondary">收支比例</Text>
                    <Progress
                      percent={Math.round((monthIncome / (monthIncome + monthExpense)) * 100)}
                      strokeColor="#52c41a"
                      format={() => `收入 ${Math.round((monthIncome / (monthIncome + monthExpense)) * 100)}%`}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* AI Insights */}
        <Col xs={24} lg={12}>
          <Card
            title={<span><RobotOutlined /> AI 洞察</span>}
            extra={
              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchAiInsights}
                loading={aiLoading}
              >
                分析
              </Button>
            }
            style={{ height: 300 }}
            bodyStyle={{ maxHeight: 240, overflowY: 'auto' }}
          >
            {aiInsights.length === 0 && aiSuggestions.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 30 }}>
                <RobotOutlined style={{ fontSize: 48, color: '#FF8C00', marginBottom: 16 }} />
                <div>
                  <Text type="secondary">点击"分析"按钮，AI 将自动分析您的数据并提供智能建议</Text>
                </div>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  style={{ marginTop: 16 }}
                  onClick={fetchAiInsights}
                  loading={aiLoading}
                >
                  开始分析
                </Button>
              </div>
            ) : (
              <Spin spinning={aiLoading}>
                {aiInsights.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong><BulbOutlined style={{ color: '#FAAD14' }} /> 洞察</Text>
                    <List
                      size="small"
                      dataSource={aiInsights}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '4px 0', border: 'none' }}>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
                {aiSuggestions.length > 0 && (
                  <div>
                    <Text strong><ThunderboltOutlined style={{ color: '#FF8C00' }} /> 建议</Text>
                    <List
                      size="small"
                      dataSource={aiSuggestions}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '4px 0', border: 'none' }}>
                          <Text type="secondary">{item}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Spin>
            )}
          </Card>
        </Col>
      </Row>

      {/* Task status chart */}
      {tasks.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="任务状态分布">
              <PieChart data={taskStatusData} height={240} showLegend={false} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="任务概览">
              <div style={{ padding: '20px 0' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="总任务" value={tasks.length} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="待处理" value={pendingTasks.length} valueStyle={{ color: '#FF8C00' }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="已完成" value={tasks.filter((t) => t.status === 'completed').length} valueStyle={{ color: '#52C41A' }} />
                  </Col>
                </Row>
                {tasks.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">完成率</Text>
                    <Progress
                      percent={Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)}
                      strokeColor="#52C41A"
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Solar projects overview */}
      {solarProjects.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title={<span><SunOutlined /> 光伏项目概览</span>}
              extra={<Button type="link" size="small" onClick={() => navigate('/solar')}>查看全部 <ArrowRightOutlined /></Button>}
            >
              <Row gutter={[16, 16]}>
                {solarProjects.slice(0, 4).map((p) => (
                  <Col xs={24} sm={12} lg={6} key={p.id}>
                    <Card size="small" hoverable>
                      <Text strong>{p.projectName}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">{p.capacity.toFixed(1)} kWp</Text>
                        <Tag style={{ marginLeft: 8 }}>{p.stage}</Tag>
                      </div>
                      {p.actualGeneration > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">累计发电: {p.actualGeneration.toFixed(0)} kWh</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default Dashboard
