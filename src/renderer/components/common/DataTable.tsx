import { Table, Input, Space, Button, type TableProps } from 'antd'
import { ReloadOutlined, ExportOutlined } from '@ant-design/icons'

interface DataTableProps<T> extends Omit<TableProps<T>, 'title'> {
  title?: string
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onRefresh?: () => void
  onExport?: () => void
  extra?: React.ReactNode
}

function DataTable<T extends object>({
  title,
  searchPlaceholder = '搜索...',
  onSearch,
  onRefresh,
  onExport,
  extra,
  ...tableProps
}: DataTableProps<T>) {
  return (
    <div>
      {/* Toolbar */}
      <Space
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Space>
          {onSearch && (
            <Input.Search
              placeholder={searchPlaceholder}
              onSearch={onSearch}
              style={{ width: 280 }}
              allowClear
            />
          )}
        </Space>
        <Space>
          {extra}
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              刷新
            </Button>
          )}
          {onExport && (
            <Button icon={<ExportOutlined />} onClick={onExport}>
              导出
            </Button>
          )}
        </Space>
      </Space>

      {/* Table */}
      <Table<T>
        {...tableProps}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          ...tableProps.pagination,
        }}
      />
    </div>
  )
}

export default DataTable
