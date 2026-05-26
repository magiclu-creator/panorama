export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type CustomerType = 'residential' | 'commercial' | 'industrial' | 'government'
export type CustomerStatus = 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
export type CustomerSource = 'referral' | 'website' | 'cold_call' | 'exhibition' | 'other'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'

export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'cash' | 'bank' | 'wechat' | 'alipay' | 'other'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type SolarStage = 'survey' | 'design' | 'procurement' | 'installation' | 'commissioning' | 'acceptance' | 'operational'
export type SystemType = 'grid_tied' | 'off_grid' | 'hybrid'
export type MountingType = 'roof' | 'ground' | 'carport' | 'bipv'

export type HealthType = 'weight' | 'blood_pressure' | 'sleep' | 'exercise' | 'mood' | 'custom'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  completedAt?: string
  isRecurring: boolean
  recurrenceRule?: string
  parentTaskId?: string
  projectId?: string
  customerId?: string
  tags: string[]
  aiClassified: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskReminder {
  id: string
  taskId: string
  remindAt: string
  type: 'system' | 'sound' | 'both'
  dismissed: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  location?: string
  color?: string
  recurrenceRule?: string
  taskId?: string
  customerId?: string
  projectId?: string
  reminders: number[]
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  address?: string
  type: CustomerType
  status: CustomerStatus
  source: CustomerSource
  tags: string[]
  notes?: string
  aiScore: number
  createdAt: string
  updatedAt: string
}

export interface Communication {
  id: string
  customerId: string
  type: 'call' | 'email' | 'meeting' | 'wechat' | 'visit' | 'other'
  content: string
  outcome?: string
  followUpDate?: string
  createdAt: string
}

export interface Contract {
  id: string
  customerId: string
  projectId?: string
  contractNo: string
  title: string
  amount: number
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'cancelled'
  signedDate?: string
  expiryDate?: string
  filePath?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: TaskPriority
  startDate?: string
  endDate?: string
  budget: number
  spent: number
  progress: number
  customerId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  dueDate?: string
  status: 'pending' | 'completed' | 'overdue'
  sortOrder: number
  completedAt?: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category?: string
  subcategory?: string
  description?: string
  date: string
  projectId?: string
  customerId?: string
  invoiceId?: string
  paymentMethod: PaymentMethod
  receiptPath?: string
  aiClassified: boolean
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNo: string
  customerId?: string
  projectId?: string
  amount: number
  tax: number
  status: InvoiceStatus
  issuedDate?: string
  dueDate?: string
  paidDate?: string
  items: InvoiceItem[]
  filePath?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface SolarProject {
  id: string
  projectId?: string
  customerId?: string
  projectName: string
  systemType: SystemType
  capacity: number
  panelCount: number
  panelModel?: string
  inverterModel?: string
  mountingType: MountingType
  roofArea?: number
  roofOrientation?: string
  roofTilt?: number
  shadingAnalysis?: Record<string, unknown>
  latitude?: number
  longitude?: number
  address?: string
  stage: SolarStage
  stageHistory: StageHistoryEntry[]
  contractAmount: number
  estimatedGeneration: number
  actualGeneration: number
  commissioningDate?: string
  acceptanceDate?: string
  warrantyExpiry?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StageHistoryEntry {
  stage: SolarStage
  enteredAt: string
  exitedAt?: string
  notes?: string
}

export interface SolarDocument {
  id: string
  solarProjectId: string
  type: string
  name: string
  filePath: string
  fileSize: number
  mimeType?: string
  notes?: string
  createdAt: string
}

export interface SolarGeneration {
  id: string
  solarProjectId: string
  date: string
  kWh: number
  peakPower?: number
  sunshineHours?: number
  weather?: string
  notes?: string
}

export interface HealthRecord {
  id: string
  date: string
  type: HealthType
  value: number
  unit?: string
  notes?: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  description?: string
  frequency: HabitFrequency
  targetCount: number
  color?: string
  icon?: string
  isActive: boolean
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  count: number
  notes?: string
}

export interface LearningGoal {
  id: string
  title: string
  description?: string
  category?: string
  targetDate?: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  resources: string[]
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  mood?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProjectResource {
  id: string
  projectId: string
  name: string
  type: 'person' | 'equipment' | 'material'
  allocation: number
  startDate?: string
  endDate?: string
}

export interface Budget {
  id: string
  name: string
  category: string
  amount: number
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface SolarEquipment {
  id: string
  solarProjectId: string
  type: 'panel' | 'inverter' | 'mounting' | 'cable' | 'combiner' | 'meter' | 'other'
  brand?: string
  model?: string
  serialNo?: string
  quantity: number
  warrantyYears?: number
  installDate?: string
  notes?: string
}

export interface Document {
  id: string
  name: string
  filePath: string
  category?: string
  relatedType?: string
  relatedId?: string
  tags: string[]
  fileSize?: number
  mimeType?: string
  createdAt: string
}

export interface AiCache {
  id: string
  promptHash: string
  response: string
  model?: string
  tokensUsed?: number
  createdAt: string
  expiresAt?: string
}

export interface AppSettings {
  key: string
  value: unknown
  updatedAt: string
}
