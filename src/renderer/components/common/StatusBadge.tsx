import { Tag } from 'antd'

const statusColors: Record<string, string> = {
  // Task status
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
  // Project status
  planning: 'blue',
  active: 'processing',
  on_hold: 'warning',
  // Customer status
  lead: 'cyan',
  prospect: 'blue',
  inactive: 'default',
  churned: 'error',
  // Invoice status
  draft: 'default',
  sent: 'processing',
  paid: 'success',
  overdue: 'error',
  // Solar stages
  survey: 'cyan',
  design: 'blue',
  procurement: 'purple',
  installation: 'orange',
  commissioning: 'gold',
  acceptance: 'green',
  operational: 'success',
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  planning: '规划中',
  active: '进行中',
  on_hold: '暂停',
  lead: '线索',
  prospect: '潜在客户',
  inactive: '不活跃',
  churned: '已流失',
  draft: '草稿',
  sent: '已发送',
  paid: '已付款',
  overdue: '逾期',
  survey: '踏勘',
  design: '设计',
  procurement: '采购',
  installation: '安装',
  commissioning: '调试',
  acceptance: '验收',
  operational: '运维',
}

interface StatusBadgeProps {
  status: string
  labels?: Record<string, string>
}

function StatusBadge({ status, labels }: StatusBadgeProps) {
  const color = statusColors[status] || 'default'
  const label = labels?.[status] || statusLabels[status] || status

  return <Tag color={color}>{label}</Tag>
}

export default StatusBadge
