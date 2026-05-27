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
      colorPrimary: '#e87a35',
      colorSuccess: '#16a34a',
      colorWarning: '#ca8a04',
      colorError: '#dc2626',
      colorInfo: '#2563eb',
      borderRadius: 4,
      fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif",
      fontSize: 13,
      colorBorder: darkMode ? '#2e2e2e' : '#e5e5e5',
      colorBgContainer: darkMode ? '#1e1e1e' : '#ffffff',
      colorBgLayout: darkMode ? '#141414' : '#f5f5f5',
      controlHeight: 32,
    },
    components: {
      Menu: {
        itemHeight: 36,
        iconSize: 16,
        fontSize: 13,
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemSelectedBg: 'rgba(232, 122, 53, 0.15)',
        darkItemSelectedColor: '#e87a35',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
        itemSelectedBg: 'rgba(232, 122, 53, 0.1)',
        itemSelectedColor: '#e87a35',
        itemHoverBg: 'rgba(0, 0, 0, 0.04)',
      },
      Button: {
        primaryShadow: 'none',
        defaultShadow: 'none',
      },
      Card: {
        borderRadiusLG: 4,
      },
      Input: {
        borderRadius: 4,
      },
      Select: {
        borderRadius: 4,
      },
      Modal: {
        borderRadiusLG: 6,
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
