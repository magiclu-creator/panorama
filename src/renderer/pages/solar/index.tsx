import { useEffect, useState, useMemo } from 'react'
import { Typography, Button, Modal, Form, Input, InputNumber, Select, Card, Row, Col, Statistic, Segmented, message } from 'antd'
import { PlusOutlined, SunOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons'
import BarChart from '../../components/charts/BarChart'
import { useSolarStore } from '../../stores/solar.store'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import SolarPipeline from './SolarPipeline'
import { SOLAR_STAGE_LABELS } from '../../../shared/constants'
import type { SolarProject } from '../../../shared/types'

const { Title } = Typography

type ViewMode = 'pipeline' | 'table'

function Solar() {
  const { projects, loading, fetchProjects, createProject, updateStage } = useSolarStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline')
  const [form] = Form.useForm()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createProject({
        projectName: values.projectName, systemType: values.systemType,
        capacity: values.capacity, panelCount: values.panelCount,
        panelModel: values.panelModel, inverterModel: values.inverterModel,
        mountingType: values.mountingType, address: values.address,
        contractAmount: values.contractAmount,
      })
      message.success('光伏项目创建成功')
      setCreateModalOpen(false)
      form.resetFields()
    } catch (e) { console.error(e) }
  }

  const handleAdvanceStage = async (id: string, currentStage: string) => {
    const stages = ['survey', 'design', 'procurement', 'installation', 'commissioning', 'acceptance', 'operational']
    const idx = stages.indexOf(currentStage)
    if (idx < stages.length - 1) {
      const next = stages[idx + 1]!
      await updateStage(id, next as SolarProject['stage'])
      message.success(`已推进到${SOLAR_STAGE_LABELS[next] || next}阶段`)
    }
  }

  const totalCapacity = projects.reduce((s, p) => s + p.capacity, 0)
  const totalGeneration = projects.reduce((s, p) => s + p.actualGeneration, 0)

  const generationChartData = useMemo(() => {
    const withGen = projects.filter((p) => p.actualGeneration > 0)
    return {
      names: withGen.map((p) => p.projectName.length > 8 ? p.projectName.slice(0, 8) + '...' : p.projectName),
      data: withGen.map((p) => p.actualGeneration),
    }
  }, [projects])

  const columns = [
    { title: '项目名称', dataIndex: 'projectName', key: 'projectName', render: (t: string) => <a>{t}</a> },
    { title: '系统类型', dataIndex: 'systemType', key: 'systemType', width: 100, render: (t: string) => ({ grid_tied: '并网', off_grid: '离网', hybrid: '混合' }[t] || t) },
    { title: '装机容量', dataIndex: 'capacity', key: 'capacity', width: 100, render: (v: number) => `${v?.toFixed(1) || 0} kWp` },
    { title: '阶段', dataIndex: 'stage', key: 'stage', width: 100, render: (s: string) => <StatusBadge status={s} labels={SOLAR_STAGE_LABELS} /> },
    { title: '合同金额', dataIndex: 'contractAmount', key: 'contractAmount', width: 120, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    { title: '累计发电', dataIndex: 'actualGeneration', key: 'actualGeneration', width: 100, render: (v: number) => v ? `${v.toFixed(0)} kWh` : '-' },
    { title: '操作', key: 'actions', width: 100, render: (_: unknown, r: SolarProject) => {
      const stages = ['survey', 'design', 'procurement', 'installation', 'commissioning', 'acceptance', 'operational']
      const canAdvance = stages.indexOf(r.stage) < stages.length - 1
      return canAdvance ? <Button type="link" size="small" onClick={() => handleAdvanceStage(r.id, r.stage)}>推进</Button> : null
    }},
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>光伏项目管理</Title>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            options={[
              { value: 'pipeline', icon: <AppstoreOutlined />, label: '管线' },
              { value: 'table', icon: <UnorderedListOutlined />, label: '列表' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>新建光伏项目</Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="总装机容量" value={totalCapacity} suffix="kWp" prefix={<SunOutlined style={{ color: '#faad14' }} />} /></Card></Col>
        <Col span={8}><Card><Statistic title="项目数量" value={projects.length} /></Card></Col>
        <Col span={8}><Card><Statistic title="累计发电量" value={totalGeneration} suffix="kWh" /></Card></Col>
      </Row>

      {generationChartData.names.length > 0 && (
        <Card title="各项目发电量对比" style={{ marginBottom: 16 }}>
          <BarChart
            xData={generationChartData.names}
            series={[{ name: '累计发电量 (kWh)', data: generationChartData.data, color: '#FAAD14' }]}
            height={220}
            yAxisName="kWh"
          />
        </Card>
      )}

      {projects.length === 0 && !loading ? (
        <EmptyState description="暂无光伏项目" actionText="新建光伏项目" onAction={() => setCreateModalOpen(true)} />
      ) : viewMode === 'pipeline' ? (
        <SolarPipeline />
      ) : (
        <DataTable<SolarProject> columns={columns} dataSource={projects} rowKey="id" loading={loading} onRefresh={fetchProjects} />
      )}

      <Modal title="新建光伏项目" open={createModalOpen} onOk={handleCreate} onCancel={() => { setCreateModalOpen(false); form.resetFields() }} okText="创建" cancelText="取消" width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}><Input placeholder="输入项目名称" /></Form.Item>
          <Form.Item name="systemType" label="系统类型" initialValue="grid_tied"><Select options={[{ value: 'grid_tied', label: '并网' }, { value: 'off_grid', label: '离网' }, { value: 'hybrid', label: '混合' }]} /></Form.Item>
          <Form.Item name="capacity" label="装机容量 (kWp)"><InputNumber style={{ width: '100%' }} min={0} step={0.1} /></Form.Item>
          <Form.Item name="panelCount" label="组件数量"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="panelModel" label="组件型号"><Input placeholder="如：隆基 Hi-MO 6" /></Form.Item>
          <Form.Item name="inverterModel" label="逆变器型号"><Input placeholder="如：华为 SUN2000" /></Form.Item>
          <Form.Item name="mountingType" label="安装方式" initialValue="roof"><Select options={[{ value: 'roof', label: '屋顶' }, { value: 'ground', label: '地面' }, { value: 'carport', label: '车棚' }, { value: 'bipv', label: 'BIPV' }]} /></Form.Item>
          <Form.Item name="address" label="安装地址"><Input placeholder="输入安装地址" /></Form.Item>
          <Form.Item name="contractAmount" label="合同金额 (元)"><InputNumber style={{ width: '100%' }} min={0} step={1000} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Solar
