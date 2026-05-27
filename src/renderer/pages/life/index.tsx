import { useEffect, useState } from 'react'
import { Typography, Card, Row, Col, Button, Form, Input, InputNumber, Select, Modal, Tabs, message } from 'antd'
import { HeartOutlined, CheckCircleOutlined, BookOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useLifeStore } from '../../stores/life.store'

const { Title, Text } = Typography

function Life() {
  const { healthRecords, habits, goals, journalEntries, fetchHealth, fetchHabits, fetchGoals, addHealth, addJournal } = useLifeStore()
  const [healthModalOpen, setHealthModalOpen] = useState(false)
  const [journalModalOpen, setJournalModalOpen] = useState(false)
  const [healthForm] = Form.useForm()
  const [journalForm] = Form.useForm()

  useEffect(() => {
    fetchHealth()
    fetchHabits()
    fetchGoals()
  }, [fetchHealth, fetchHabits, fetchGoals])

  const handleAddHealth = async () => {
    try {
      const values = await healthForm.validateFields()
      await addHealth({ date: values.date, type: values.type, value: values.value, unit: values.unit })
      message.success('健康记录已添加')
      setHealthModalOpen(false)
      healthForm.resetFields()
    } catch (e) { console.error(e) }
  }

  const handleAddJournal = async () => {
    try {
      const values = await journalForm.validateFields()
      await addJournal({ date: new Date().toISOString(), title: values.title, content: values.content, mood: values.mood, tags: [] })
      message.success('日记已保存')
      setJournalModalOpen(false)
      journalForm.resetFields()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>生活管理</Title>
      </div>

      <Tabs items={[
        { key: 'overview', label: '概览', children: (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable onClick={() => setHealthModalOpen(true)} style={{ textAlign: 'center', height: 180 }}>
                <HeartOutlined style={{ fontSize: 36, color: '#FF4D4F' }} />
                <Title level={5} style={{ marginTop: 12 }}>健康追踪</Title>
                <Text type="secondary">{healthRecords.length} 条记录</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ textAlign: 'center', height: 180 }}>
                <CheckCircleOutlined style={{ fontSize: 36, color: '#52C41A' }} />
                <Title level={5} style={{ marginTop: 12 }}>习惯打卡</Title>
                <Text type="secondary">{habits.length} 个习惯</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ textAlign: 'center', height: 180 }}>
                <BookOutlined style={{ fontSize: 36, color: '#1890ff' }} />
                <Title level={5} style={{ marginTop: 12 }}>学习目标</Title>
                <Text type="secondary">{goals.length} 个目标</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable onClick={() => setJournalModalOpen(true)} style={{ textAlign: 'center', height: 180 }}>
                <EditOutlined style={{ fontSize: 36, color: '#722ED1' }} />
                <Title level={5} style={{ marginTop: 12 }}>日记</Title>
                <Text type="secondary">{journalEntries.length} 篇</Text>
              </Card>
            </Col>
          </Row>
        )},
        { key: 'health', label: '健康', children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setHealthModalOpen(true)}>添加记录</Button>
            </div>
            {healthRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>暂无健康记录</div>
            ) : (
              <div>
                {healthRecords.slice(0, 20).map((r) => (
                  <Card key={r.id} size="small" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{({ weight: '体重', blood_pressure: '血压', sleep: '睡眠', exercise: '运动', mood: '心情' } as Record<string, string>)[r.type] || r.type}</Text>
                      <Text strong>{r.value} {r.unit || ''}</Text>
                      <Text type="secondary">{new Date(r.date).toLocaleDateString('zh-CN')}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )},
        { key: 'journal', label: '日记', children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setJournalModalOpen(true)}>写日记</Button>
            </div>
            {journalEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>开始写第一篇日记吧</div>
            ) : (
              <div>
                {journalEntries.map((e) => (
                  <Card key={e.id} style={{ marginBottom: 16 }}>
                    <Title level={5}>{e.title || '无标题'}</Title>
                    <Text type="secondary">{new Date(e.date).toLocaleDateString('zh-CN')} {e.mood && `| 心情: ${e.mood}`}</Text>
                    <div style={{ marginTop: 8 }}>{e.content}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )},
      ]} />

      {/* Health Modal */}
      <Modal title="添加健康记录" open={healthModalOpen} onOk={handleAddHealth} onCancel={() => { setHealthModalOpen(false); healthForm.resetFields() }}>
        <Form form={healthForm} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}><Select options={[{ value: 'weight', label: '体重' }, { value: 'blood_pressure', label: '血压' }, { value: 'sleep', label: '睡眠' }, { value: 'exercise', label: '运动' }, { value: 'mood', label: '心情' }]} /></Form.Item>
          <Form.Item name="value" label="数值" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unit" label="单位"><Input placeholder="如：kg, 小时, 分钟" /></Form.Item>
          <Form.Item name="date" label="日期" initialValue={new Date().toISOString().split('T')[0]}><Input type="date" /></Form.Item>
        </Form>
      </Modal>

      {/* Journal Modal */}
      <Modal title="写日记" open={journalModalOpen} onOk={handleAddJournal} onCancel={() => { setJournalModalOpen(false); journalForm.resetFields() }}>
        <Form form={journalForm} layout="vertical">
          <Form.Item name="title" label="标题"><Input placeholder="输入标题（可选）" /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={6} placeholder="写下你的想法..." /></Form.Item>
          <Form.Item name="mood" label="心情"><Select allowClear options={[{ value: 'happy', label: '开心' }, { value: 'normal', label: '一般' }, { value: 'sad', label: '低落' }, { value: 'excited', label: '兴奋' }, { value: 'tired', label: '疲惫' }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Life
