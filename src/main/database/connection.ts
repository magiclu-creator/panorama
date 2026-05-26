import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { getDbPath } from '../utils/paths'
import { logger } from '../utils/logger'
import { schema } from './schema'

let db: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function getSqlite() {
  if (!sqlite) throw new Error('SQLite not initialized')
  return sqlite
}

export async function initializeDatabase(): Promise<void> {
  try {
    const dbPath = getDbPath()
    logger.info(`Initializing database at: ${dbPath}`)

    sqlite = new Database(dbPath)

    // Enable WAL mode for better concurrent performance
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    sqlite.pragma('busy_timeout = 5000')

    // Enable encryption if available (requires SQLCipher)
    // sqlite.pragma(`key = '${encryptionKey}'`)

    db = drizzle(sqlite, { schema })

    // Run migrations
    runMigrations(sqlite)

    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize database', error)
    throw error
  }
}

function runMigrations(sqlite: Database.Database): void {
  logger.info('Running database migrations...')

  // Create tables
  sqlite.exec(`
    -- Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      due_date TEXT,
      completed_at TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurrence_rule TEXT,
      parent_task_id TEXT REFERENCES tasks(id),
      project_id TEXT,
      customer_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      ai_classified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);

    -- Task Reminders
    CREATE TABLE IF NOT EXISTS task_reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      remind_at TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system' CHECK(type IN ('system', 'sound', 'both')),
      dismissed INTEGER NOT NULL DEFAULT 0
    );

    -- Calendar Events
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      all_day INTEGER NOT NULL DEFAULT 0,
      location TEXT,
      color TEXT,
      recurrence_rule TEXT,
      task_id TEXT REFERENCES tasks(id),
      customer_id TEXT,
      project_id TEXT,
      reminders TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
    CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      type TEXT NOT NULL DEFAULT 'residential' CHECK(type IN ('residential', 'commercial', 'industrial', 'government')),
      status TEXT NOT NULL DEFAULT 'lead' CHECK(status IN ('lead', 'prospect', 'active', 'inactive', 'churned')),
      source TEXT NOT NULL DEFAULT 'other' CHECK(source IN ('referral', 'website', 'cold_call', 'exhibition', 'other')),
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      ai_score INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
    CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);

    -- Communications
    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('call', 'email', 'meeting', 'wechat', 'visit', 'other')),
      content TEXT NOT NULL,
      outcome TEXT,
      follow_up_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON communications(customer_id);

    -- Contracts
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      project_id TEXT,
      contract_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'signed', 'completed', 'cancelled')),
      signed_date TEXT,
      expiry_date TEXT,
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);
    CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      start_date TEXT,
      end_date TEXT,
      budget REAL NOT NULL DEFAULT 0,
      spent REAL NOT NULL DEFAULT 0,
      progress INTEGER NOT NULL DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      customer_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

    -- Milestones
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'overdue')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);

    -- Project Resources
    CREATE TABLE IF NOT EXISTS project_resources (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('person', 'equipment', 'material')),
      allocation INTEGER NOT NULL DEFAULT 100,
      start_date TEXT,
      end_date TEXT
    );

    -- Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT,
      subcategory TEXT,
      description TEXT,
      date TEXT NOT NULL,
      project_id TEXT,
      customer_id TEXT,
      invoice_id TEXT,
      payment_method TEXT NOT NULL DEFAULT 'bank' CHECK(payment_method IN ('cash', 'bank', 'wechat', 'alipay', 'other')),
      receipt_path TEXT,
      ai_classified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      project_id TEXT,
      amount REAL NOT NULL,
      tax REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
      issued_date TEXT,
      due_date TEXT,
      paid_date TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

    -- Budgets
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly', 'quarterly', 'yearly')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Health Records
    CREATE TABLE IF NOT EXISTS health_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('weight', 'blood_pressure', 'sleep', 'exercise', 'mood', 'custom')),
      value REAL NOT NULL,
      unit TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
    CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(type);

    -- Habits
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL DEFAULT 'daily' CHECK(frequency IN ('daily', 'weekly', 'custom')),
      target_count INTEGER NOT NULL DEFAULT 1,
      color TEXT,
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Habit Logs
    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

    -- Learning Goals
    CREATE TABLE IF NOT EXISTS learning_goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      target_date TEXT,
      progress INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      resources TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Journal Entries
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);

    -- Solar Projects
    CREATE TABLE IF NOT EXISTS solar_projects (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id),
      customer_id TEXT REFERENCES customers(id),
      project_name TEXT NOT NULL,
      system_type TEXT NOT NULL DEFAULT 'grid_tied' CHECK(system_type IN ('grid_tied', 'off_grid', 'hybrid')),
      capacity REAL NOT NULL DEFAULT 0,
      panel_count INTEGER NOT NULL DEFAULT 0,
      panel_model TEXT,
      inverter_model TEXT,
      mounting_type TEXT NOT NULL DEFAULT 'roof' CHECK(mounting_type IN ('roof', 'ground', 'carport', 'bipv')),
      roof_area REAL,
      roof_orientation TEXT,
      roof_tilt REAL,
      shading_analysis TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      stage TEXT NOT NULL DEFAULT 'survey' CHECK(stage IN ('survey', 'design', 'procurement', 'installation', 'commissioning', 'acceptance', 'operational')),
      stage_history TEXT NOT NULL DEFAULT '[]',
      contract_amount REAL NOT NULL DEFAULT 0,
      estimated_generation REAL NOT NULL DEFAULT 0,
      actual_generation REAL NOT NULL DEFAULT 0,
      commissioning_date TEXT,
      acceptance_date TEXT,
      warranty_expiry TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_solar_projects_stage ON solar_projects(stage);
    CREATE INDEX IF NOT EXISTS idx_solar_projects_customer_id ON solar_projects(customer_id);

    -- Solar Documents
    CREATE TABLE IF NOT EXISTS solar_documents (
      id TEXT PRIMARY KEY,
      solar_project_id TEXT NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_solar_documents_project_id ON solar_documents(solar_project_id);

    -- Solar Generation
    CREATE TABLE IF NOT EXISTS solar_generation (
      id TEXT PRIMARY KEY,
      solar_project_id TEXT NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      kwh REAL NOT NULL,
      peak_power REAL,
      sunshine_hours REAL,
      weather TEXT,
      notes TEXT,
      UNIQUE(solar_project_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_solar_generation_project_id ON solar_generation(solar_project_id);
    CREATE INDEX IF NOT EXISTS idx_solar_generation_date ON solar_generation(date);

    -- Solar Equipment
    CREATE TABLE IF NOT EXISTS solar_equipment (
      id TEXT PRIMARY KEY,
      solar_project_id TEXT NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('panel', 'inverter', 'mounting', 'cable', 'combiner', 'meter', 'other')),
      brand TEXT,
      model TEXT,
      serial_no TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      warranty_years INTEGER,
      install_date TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_solar_equipment_project_id ON solar_equipment(solar_project_id);

    -- App Settings
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Documents (generic vault)
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      category TEXT,
      related_type TEXT,
      related_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      file_size INTEGER,
      mime_type TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_documents_related ON documents(related_type, related_id);

    -- AI Cache
    CREATE TABLE IF NOT EXISTS ai_cache (
      id TEXT PRIMARY KEY,
      prompt_hash TEXT NOT NULL UNIQUE,
      response TEXT NOT NULL,
      model TEXT,
      tokens_used INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash ON ai_cache(prompt_hash);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);
  `)

  logger.info('Database migrations completed')
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
    logger.info('Database closed')
  }
}
