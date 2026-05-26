export const APP_NAME = 'panorama'
export const APP_DISPLAY_NAME = '全景'
export const APP_VERSION = '0.1.0'

export const IPC_CHANNELS = {
  DB: {
    QUERY: 'db:query',
    EXECUTE: 'db:execute',
  },
  TASKS: {
    LIST: 'tasks:list',
    GET: 'tasks:get',
    CREATE: 'tasks:create',
    UPDATE: 'tasks:update',
    DELETE: 'tasks:delete',
    SEARCH: 'tasks:search',
  },
  EVENTS: {
    LIST: 'events:list',
    GET: 'events:get',
    CREATE: 'events:create',
    UPDATE: 'events:update',
    DELETE: 'events:delete',
  },
  CUSTOMERS: {
    LIST: 'customers:list',
    GET: 'customers:get',
    CREATE: 'customers:create',
    UPDATE: 'customers:update',
    DELETE: 'customers:delete',
    SEARCH: 'customers:search',
  },
  PROJECTS: {
    LIST: 'projects:list',
    GET: 'projects:get',
    CREATE: 'projects:create',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
  },
  FINANCE: {
    LIST_TRANSACTIONS: 'finance:listTransactions',
    CREATE_TRANSACTION: 'finance:createTransaction',
    UPDATE_TRANSACTION: 'finance:updateTransaction',
    DELETE_TRANSACTION: 'finance:deleteTransaction',
    LIST_INVOICES: 'finance:listInvoices',
    CREATE_INVOICE: 'finance:createInvoice',
  },
  SOLAR: {
    LIST: 'solar:list',
    GET: 'solar:get',
    CREATE: 'solar:create',
    UPDATE: 'solar:update',
    UPDATE_STAGE: 'solar:updateStage',
    ADD_GENERATION: 'solar:addGeneration',
    GET_GENERATION: 'solar:getGeneration',
  },
  LIFE: {
    LIST_HEALTH: 'life:listHealth',
    ADD_HEALTH: 'life:addHealth',
    LIST_HABITS: 'life:listHabits',
    LOG_HABIT: 'life:logHabit',
    LIST_GOALS: 'life:listGoals',
    ADD_JOURNAL: 'life:addJournal',
  },
  AI: {
    CHAT: 'ai:chat',
    CLASSIFY: 'ai:classify',
    PARSE_INTENT: 'ai:parseIntent',
    ANALYZE: 'ai:analyze',
  },
  FILE: {
    SAVE: 'file:save',
    OPEN: 'file:open',
    EXPORT: 'file:export',
    IMPORT: 'file:import',
  },
  APP: {
    GET_SETTINGS: 'app:getSettings',
    SET_SETTING: 'app:setSetting',
    GET_VERSION: 'app:getVersion',
  },
} as const

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const SOLAR_STAGES = {
  SURVEY: 'survey',
  DESIGN: 'design',
  PROCUREMENT: 'procurement',
  INSTALLATION: 'installation',
  COMMISSIONING: 'commissioning',
  ACCEPTANCE: 'acceptance',
  OPERATIONAL: 'operational',
} as const

export const SOLAR_STAGE_LABELS: Record<string, string> = {
  survey: '踏勘',
  design: '设计',
  procurement: '采购',
  installation: '安装',
  commissioning: '调试',
  acceptance: '验收',
  operational: '运维',
}
