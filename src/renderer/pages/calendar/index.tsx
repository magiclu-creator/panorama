import { useState, useEffect } from 'react'
import { Typography, Card, Button, Space, Calendar as AntCalendar, Badge, Modal, Form, Input, DatePicker, message } from 'antd'
import { PlusOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import type { CalendarEvent } from '../../../shared/types'

const { Title, Text } = Typography

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const result = await window.panorama.events.list()
      setEvents((result as unknown as CalendarEvent[]) || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await window.panorama.events.create({
        title: values.title,
        description: values.description,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        allDay: values.allDay || false,
        location: values.location,
      })
      message.success('日程创建成功')
      setCreateModalOpen(false)
      form.resetFields()
      fetchEvents()
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const getEventsForDate = (date: Dayjs) => {
    return events.filter((e) => dayjs(e.startTime).isSame(date, 'day'))
  }

  const dateCellRender = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date)
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvents.slice(0, 3).map((event) => (
          <li key={event.id} style={{ marginBottom: 2 }}>
            <Badge
              status={event.color ? 'processing' : 'success'}
              text={
                <Text style={{ fontSize: 11 }} ellipsis>
                  {event.title}
                </Text>
              }
            />
          </li>
        ))}
        {dayEvents.length > 3 && (
          <li>
            <Text type="secondary" style={{ fontSize: 11 }}>
              +{dayEvents.length - 3} 更多
            </Text>
          </li>
        )}
      </ul>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>
          日历
        </Title>
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => setSelectedDate(selectedDate.subtract(1, 'month'))}
          />
          <Button onClick={() => setSelectedDate(dayjs())}>
            今天
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={() => setSelectedDate(selectedDate.add(1, 'month'))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建日程
          </Button>
        </Space>
      </div>

      <Card>
        <AntCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          cellRender={(date, info) => {
            if (info.type === 'date') {
              return dateCellRender(date)
            }
            return info.originNode
          }}
        />
      </Card>

      {/* Create Event Modal */}
      <Modal
        title="新建日程"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="日程标题"
            rules={[{ required: true, message: '请输入日程标题' }]}
          >
            <Input placeholder="输入日程标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="输入描述（可选）" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input placeholder="输入地点（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CalendarPage
