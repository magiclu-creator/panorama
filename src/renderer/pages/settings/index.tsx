import { useState, useEffect } from 'react'
import { Typography, Card, Form, Input, Switch, Button, Space, message, List, Popconfirm, Tag } from 'antd'
import {
  BulbOutlined, ExportOutlined, ImportOutlined, CloudDownloadOutlined,
  CloudUploadOutlined, CloudSyncOutlined, FolderOutlined, DeleteOutlined, SaveOutlined,
} from '@ant-design/icons'
import { useSettingsStore } from '../../stores/settings.store'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography

interface BackupItem {
  name: string
  path: string
  size: number
  date: string
}

function Settings() {
  const { settings, fetchSettings, setSetting } = useSettingsStore()
  const { darkMode, toggleDarkMode } = useTheme()
  const [apiKey, setApiKey] = useState('')
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [syncDir, setSyncDir] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)

  useEffect(() => { fetchSettings() }, [fetchSettings])

  useEffect(() => {
    if (settings.aiApiKey) setApiKey(settings.aiApiKey as string)
  }, [settings])

  useEffect(() => {
    loadBackups()
    loadSyncStatus()
  }, [])

  const loadBackups = async () => {
    try {
      const list = await window.panorama.backup.list() as BackupItem[]
      setBackups(list)
    } catch { /* ignore */ }
  }

  const loadSyncStatus = async () => {
    try {
      const status = await window.panorama.sync.status() as { syncDir: string | null; lastSync: string | null }
      setSyncDir(status.syncDir)
      setLastSync(status.lastSync)
    } catch { /* ignore */ }
  }

  const handleSaveApiKey = async () => {
    await setSetting('aiApiKey', apiKey)
    message.success('API Key 已保存')
  }

  const handleToggleDarkMode = async (checked: boolean) => {
    toggleDarkMode()
    await setSetting('darkMode', checked)
    message.success(checked ? '已切换到深色模式' : '已切换到浅色模式')
  }

  const handleCreateBackup = async () => {
    const result = await window.panorama.backup.create() as { success: boolean; path: string; error?: string }
    if (result.success) {
      message.success('备份已创建')
      loadBackups()
    } else {
      message.error(result.error || '备份失败')
    }
  }

  const handleRestoreBackup = async (path: string) => {
    const result = await window.panorama.backup.restore(path) as { success: boolean; error?: string }
    if (result.success) {
      message.success('已恢复备份，应用将重新加载')
      setTimeout(() => window.location.reload(), 1000)
    } else {
      message.error(result.error || '恢复失败')
    }
  }

  const handleDeleteBackup = async (path: string) => {
    const result = await window.panorama.backup.delete(path) as { success: boolean; error?: string }
    if (result.success) {
      message.success('已删除备份')
      loadBackups()
    } else {
      message.error(result.error || '删除失败')
    }
  }

  const handleExportJson = async () => {
    const result = await window.panorama.backup.exportJson() as { success: boolean; path?: string; error?: string }
    if (result.success) {
      message.success(`已导出到: ${result.path}`)
    } else if (result.error !== '已取消') {
      message.error(result.error || '导出失败')
    }
  }

  const handleImportJson = async () => {
    const result = await window.panorama.backup.importJson() as { success: boolean; error?: string }
    if (result.success) {
      message.success('导入成功，应用将重新加载')
      setTimeout(() => window.location.reload(), 1000)
    } else if (result.error !== '已取消') {
      message.error(result.error || '导入失败')
    }
  }

  const handleSetSyncDir = async () => {
    const result = await window.panorama.sync.setDirectory() as { success: boolean; error?: string }
    if (result.success) {
      message.success('同步目录已设置')
      loadSyncStatus()
    } else if (result.error !== '已取消') {
      message.error(result.error || '设置失败')
    }
  }

  const handleSyncUpload = async () => {
    setSyncLoading(true)
    try {
      const result = await window.panorama.sync.upload() as { success: boolean; error?: string }
      if (result.success) {
        message.success('已同步到云端')
        loadSyncStatus()
      } else {
        message.error(result.error || '同步失败')
      }
    } finally {
      setSyncLoading(false)
    }
  }

  const handleSyncDownload = async () => {
    setSyncLoading(true)
    try {
      const result = await window.panorama.sync.download() as { success: boolean; error?: string }
      if (result.success) {
        message.success('已从云端同步，应用将重新加载')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        message.error(result.error || '同步失败')
      }
    } finally {
      setSyncLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>设置</Title>
      </div>

      {/* AI Config */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>AI 配置</Title>
        <Form layout="vertical" style={{ maxWidth: 500 }}>
          <Form.Item label="Anthropic API Key">
            <Space.Compact style={{ width: '100%' }}>
              <Input.Password
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <Button type="primary" onClick={handleSaveApiKey}>保存</Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Card>

      {/* Appearance */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>外观</Title>
        <Form layout="vertical" style={{ maxWidth: 500 }}>
          <Form.Item label={<span><BulbOutlined /> 深色模式</span>}>
            <Switch checked={darkMode} onChange={handleToggleDarkMode} />
          </Form.Item>
        </Form>
      </Card>

      {/* Cloud Sync */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}><CloudSyncOutlined /> 云同步</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          选择 OneDrive、Dropbox 或其他云盘同步目录，实现多设备数据同步
        </Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<FolderOutlined />} onClick={handleSetSyncDir}>选择同步目录</Button>
            {syncDir && <Tag color="blue">{syncDir}</Tag>}
          </div>
          {syncDir && (
            <Space>
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleSyncUpload} loading={syncLoading}>上传到云端</Button>
              <Button icon={<CloudDownloadOutlined />} onClick={handleSyncDownload} loading={syncLoading}>从云端下载</Button>
            </Space>
          )}
          {lastSync && (
            <Text type="secondary">上次同步: {new Date(lastSync).toLocaleString('zh-CN')}</Text>
          )}
        </Space>
      </Card>

      {/* Backup */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>数据备份</Title>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleCreateBackup}>创建备份</Button>
          <Button icon={<ExportOutlined />} onClick={handleExportJson}>导出 JSON</Button>
          <Button icon={<ImportOutlined />} onClick={handleImportJson}>导入 JSON</Button>
        </Space>
        {backups.length > 0 && (
          <List
            size="small"
            bordered
            dataSource={backups.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="restore" type="link" size="small" onClick={() => handleRestoreBackup(item.path)}>恢复</Button>,
                  <Popconfirm key="delete" title="确认删除此备份？" onConfirm={() => handleDeleteBackup(item.path)}>
                    <Button type="link" danger size="small"><DeleteOutlined /></Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`${formatSize(item.size)} - ${new Date(item.date).toLocaleString('zh-CN')}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Text type="secondary">全景 Panorama v0.1.0</Text>
    </div>
  )
}

export default Settings
