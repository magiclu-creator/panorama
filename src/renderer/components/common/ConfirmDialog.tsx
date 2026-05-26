import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={
        <span>
          <ExclamationCircleOutlined style={{ marginRight: 8, color: danger ? '#ff4d4f' : '#faad14' }} />
          {title}
        </span>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
    >
      <p>{message}</p>
    </Modal>
  )
}

export default ConfirmDialog
