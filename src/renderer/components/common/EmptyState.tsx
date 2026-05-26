import { Empty, Button } from 'antd'

interface EmptyStateProps {
  description?: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
}

function EmptyState({
  description = '暂无数据',
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
