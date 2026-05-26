import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme as antTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import App from './App'
import './styles/global.css'

dayjs.locale('zh-cn')

const { darkAlgorithm, defaultAlgorithm } = antTheme

function ThemedApp() {
  const { darkMode } = useTheme()

  const theme = useMemo(() => ({
    algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#FF8C00',
      colorSuccess: '#52C41A',
      colorWarning: '#FAAD14',
      colorError: '#FF4D4F',
      colorInfo: '#1E3A5F',
      borderRadius: 8,
      fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    },
    components: {
      Menu: {
        darkItemBg: '#1E3A5F',
        darkSubMenuItemBg: '#162D4A',
        darkItemSelectedBg: '#FF8C00',
      },
      Button: {
        primaryShadow: '0 2px 0 rgba(255, 140, 0, 0.1)',
      },
    },
  }), [darkMode])

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
)
