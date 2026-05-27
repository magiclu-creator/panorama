import { Card, Tag, Typography, message } from 'antd'
import { SunOutlined } from '@ant-design/icons'
import { useSolarStore } from '../../stores/solar.store'
import type { SolarProject } from '../../../shared/types'

const { Text } = Typography

const stages: { key: string; title: string; color: string }[] = [
  { key: 'survey', title: '踏勘', color: '#8c8c8c' },
  { key: 'design', title: '设计', color: '#1890ff' },
  { key: 'procurement', title: '采购', color: '#722ed1' },
  { key: 'installation', title: '安装', color: '#faad14' },
  { key: 'commissioning', title: '调试', color: '#13c2c2' },
  { key: 'acceptance', title: '验收', color: '#52c41a' },
  { key: 'operational', title: '运维', color: '#e87a35' },
]

const systemTypeLabels: Record<string, string> = {
  grid_tied: '并网', off_grid: '离网', hybrid: '混合',
}

function SolarProjectCard({ project }: { project: SolarProject }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('projectId', project.id)
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
        <Text strong style={{ flex: 1, fontSize: 13 }}>{project.projectName}</Text>
      </div>
      <div style={{ marginTop: 6 }}>
        <Tag>{systemTypeLabels[project.systemType] || project.systemType}</Tag>
        <Text type="secondary" style={{ fontSize: 11 }}>{project.capacity.toFixed(1)} kWp</Text>
      </div>
      {project.contractAmount > 0 && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
          合同: ¥{project.contractAmount.toLocaleString()}
        </Text>
      )}
      {project.actualGeneration > 0 && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
          发电: {project.actualGeneration.toFixed(0)} kWh
        </Text>
      )}
    </Card>
  )
}

function SolarPipeline() {
  const { projects, updateStage } = useSolarStore()

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    const projectId = e.dataTransfer.getData('projectId')
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project && project.stage !== targetStage) {
        await updateStage(projectId, targetStage as SolarProject['stage'])
        message.success(`已移动到「${stages.find((s) => s.key === targetStage)?.title || targetStage}」阶段`)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {stages.map((stage) => {
        const stageProjects = projects.filter((p) => p.stage === stage.key)
        return (
          <div
            key={stage.key}
            style={{ flex: '1 0 200px', maxWidth: 240 }}
            onDrop={(e) => handleDrop(e, stage.key)}
            onDragOver={handleDragOver}
          >
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: stage.color,
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong style={{ color: '#fff', fontSize: 13 }}>{stage.title}</Text>
              <Tag color="rgba(255,255,255,0.3)" style={{ color: '#fff', border: 'none' }}>
                {stageProjects.length}
              </Tag>
            </div>
            <div
              style={{
                padding: 8,
                backgroundColor: '#fafafa',
                borderRadius: '0 0 8px 8px',
                minHeight: 160,
                maxHeight: 'calc(100vh - 340px)',
                overflowY: 'auto',
              }}
            >
              {stageProjects.map((project) => (
                <SolarProjectCard key={project.id} project={project} />
              ))}
              {stageProjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: '#bfbfbf', fontSize: 12 }}>
                  <SunOutlined style={{ display: 'block', marginBottom: 4 }} />
                  拖拽项目到此处
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SolarPipeline
