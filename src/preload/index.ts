import { contextBridge, ipcRenderer } from 'electron'

// Define the API that will be exposed to the renderer
const panoramaAPI = {
  // App
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getSettings: () => ipcRenderer.invoke('app:getSettings'),
    setSetting: (key: string, value: unknown) => ipcRenderer.invoke('app:setSetting', key, value),
  },

  // Tasks
  tasks: {
    list: (filters?: unknown) => ipcRenderer.invoke('tasks:list', filters),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    create: (task: unknown) => ipcRenderer.invoke('tasks:create', task),
    update: (id: string, updates: unknown) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
    search: (query: string) => ipcRenderer.invoke('tasks:search', query),
  },

  // Events
  events: {
    list: (filters?: unknown) => ipcRenderer.invoke('events:list', filters),
    get: (id: string) => ipcRenderer.invoke('events:get', id),
    create: (event: unknown) => ipcRenderer.invoke('events:create', event),
    update: (id: string, updates: unknown) => ipcRenderer.invoke('events:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('events:delete', id),
  },

  // Customers
  customers: {
    list: (filters?: unknown) => ipcRenderer.invoke('customers:list', filters),
    get: (id: string) => ipcRenderer.invoke('customers:get', id),
    create: (customer: unknown) => ipcRenderer.invoke('customers:create', customer),
    update: (id: string, updates: unknown) => ipcRenderer.invoke('customers:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('customers:delete', id),
    search: (query: string) => ipcRenderer.invoke('customers:search', query),
  },

  // Projects
  projects: {
    list: (filters?: unknown) => ipcRenderer.invoke('projects:list', filters),
    get: (id: string) => ipcRenderer.invoke('projects:get', id),
    create: (project: unknown) => ipcRenderer.invoke('projects:create', project),
    update: (id: string, updates: unknown) => ipcRenderer.invoke('projects:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
  },

  // Finance
  finance: {
    listTransactions: (filters?: unknown) => ipcRenderer.invoke('finance:listTransactions', filters),
    createTransaction: (transaction: unknown) => ipcRenderer.invoke('finance:createTransaction', transaction),
    updateTransaction: (id: string, updates: unknown) => ipcRenderer.invoke('finance:updateTransaction', id, updates),
    deleteTransaction: (id: string) => ipcRenderer.invoke('finance:deleteTransaction', id),
    listInvoices: (filters?: unknown) => ipcRenderer.invoke('finance:listInvoices', filters),
    createInvoice: (invoice: unknown) => ipcRenderer.invoke('finance:createInvoice', invoice),
  },

  // Solar
  solar: {
    list: (filters?: unknown) => ipcRenderer.invoke('solar:list', filters),
    get: (id: string) => ipcRenderer.invoke('solar:get', id),
    create: (project: unknown) => ipcRenderer.invoke('solar:create', project),
    update: (id: string, updates: unknown) => ipcRenderer.invoke('solar:update', id, updates),
    updateStage: (id: string, stage: string) => ipcRenderer.invoke('solar:updateStage', id, stage),
    addGeneration: (data: unknown) => ipcRenderer.invoke('solar:addGeneration', data),
    getGeneration: (id: string, filters?: unknown) => ipcRenderer.invoke('solar:getGeneration', id, filters),
  },

  // Life
  life: {
    listHealth: (filters?: unknown) => ipcRenderer.invoke('life:listHealth', filters),
    addHealth: (record: unknown) => ipcRenderer.invoke('life:addHealth', record),
    listHabits: () => ipcRenderer.invoke('life:listHabits'),
    logHabit: (data: unknown) => ipcRenderer.invoke('life:logHabit', data),
    listGoals: () => ipcRenderer.invoke('life:listGoals'),
    addJournal: (entry: unknown) => ipcRenderer.invoke('life:addJournal', entry),
  },

  // AI
  ai: {
    chat: (messages: unknown[], options?: unknown) => ipcRenderer.invoke('ai:chat', messages, options),
    classify: (text: string, type: string) => ipcRenderer.invoke('ai:classify', text, type),
    parseIntent: (text: string) => ipcRenderer.invoke('ai:parseIntent', text),
    analyze: (module: string, data: unknown) => ipcRenderer.invoke('ai:analyze', module, data),
  },

  // File
  file: {
    save: (file: unknown, category: string) => ipcRenderer.invoke('file:save', file, category),
    open: (path: string) => ipcRenderer.invoke('file:open', path),
    exportData: (module: string, format: string) => ipcRenderer.invoke('file:export', module, format),
    importData: (module: string, filePath: string) => ipcRenderer.invoke('file:import', module, filePath),
  },

  // Backup
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    list: () => ipcRenderer.invoke('backup:list'),
    restore: (backupPath: string) => ipcRenderer.invoke('backup:restore', backupPath),
    delete: (backupPath: string) => ipcRenderer.invoke('backup:delete', backupPath),
    exportJson: () => ipcRenderer.invoke('backup:exportJson'),
    importJson: () => ipcRenderer.invoke('backup:importJson'),
  },

  // Sync
  sync: {
    setDirectory: () => ipcRenderer.invoke('sync:setDirectory'),
    getDirectory: () => ipcRenderer.invoke('sync:getDirectory'),
    upload: () => ipcRenderer.invoke('sync:upload'),
    download: () => ipcRenderer.invoke('sync:download'),
    status: () => ipcRenderer.invoke('sync:status'),
  },

  // Notification
  notification: {
    show: (title: string, body: string) => ipcRenderer.invoke('notification:show', title, body),
  },

  // Update
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    onChecking: (cb: () => void) => ipcRenderer.on('update:checking', cb),
    onAvailable: (cb: (info: unknown) => void) => ipcRenderer.on('update:available', (_e, info) => cb(info)),
    onNotAvailable: (cb: () => void) => ipcRenderer.on('update:not-available', cb),
    onProgress: (cb: (progress: unknown) => void) => ipcRenderer.on('update:progress', (_e, progress) => cb(progress)),
    onDownloaded: (cb: (info: unknown) => void) => ipcRenderer.on('update:downloaded', (_e, info) => cb(info)),
    onError: (cb: (err: unknown) => void) => ipcRenderer.on('update:error', (_e, err) => cb(err)),
  },
}

// Expose the API to the renderer via contextBridge
contextBridge.exposeInMainWorld('panorama', panoramaAPI)

// Type declaration for the renderer
export type PanoramaAPI = typeof panoramaAPI
