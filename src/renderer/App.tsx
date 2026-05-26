import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import AppShell from './components/layout/AppShell'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/dashboard'))
const Tasks = lazy(() => import('./pages/tasks'))
const Calendar = lazy(() => import('./pages/calendar'))
const Customers = lazy(() => import('./pages/customers'))
const Projects = lazy(() => import('./pages/projects'))
const Finance = lazy(() => import('./pages/finance'))
const Solar = lazy(() => import('./pages/solar'))
const Life = lazy(() => import('./pages/life'))
const Settings = lazy(() => import('./pages/settings'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large" />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/solar" element={<Solar />} />
            <Route path="/life" element={<Life />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  )
}

export default App
