import { useState, useRef, useCallback } from 'react'
import { Button, message, Typography } from 'antd'
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons'

const { Text } = Typography

interface VoiceInputProps {
  onResult: (text: string) => void
  disabled?: boolean
}

function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      message.error('当前环境不支持语音识别')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      if (result) {
        const text = result[0]?.transcript || ''
        setTranscript(text)
        if (result.isFinal) {
          onResult(text)
          setListening(false)
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setListening(false)
      if (event.error === 'not-allowed') {
        message.error('请允许麦克风权限')
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return (
    <div>
      <Button
        type={listening ? 'primary' : 'default'}
        icon={listening ? <AudioOutlined /> : <AudioMutedOutlined />}
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        danger={listening}
      >
        {listening ? '停止录音' : '语音输入'}
      </Button>
      {transcript && (
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
          {transcript}
        </Text>
      )}
    </div>
  )
}

export default VoiceInput
