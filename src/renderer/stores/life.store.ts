import { create } from 'zustand'
import type { HealthRecord, Habit, HabitLog, LearningGoal, JournalEntry } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface LifeState {
  healthRecords: HealthRecord[]
  habits: Habit[]
  habitLogs: HabitLog[]
  goals: LearningGoal[]
  journalEntries: JournalEntry[]
  loading: boolean

  setHealthRecords: (records: HealthRecord[]) => void
  addHealthRecord: (record: HealthRecord) => void
  setHabits: (habits: Habit[]) => void
  addHabitLog: (log: HabitLog) => void
  setGoals: (goals: LearningGoal[]) => void
  setJournalEntries: (entries: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void
  setLoading: (loading: boolean) => void
  fetchHealth: () => Promise<void>
  addHealth: (data: Partial<HealthRecord>) => Promise<void>
  fetchHabits: () => Promise<void>
  logHabit: (data: Partial<HabitLog>) => Promise<void>
  fetchGoals: () => Promise<void>
  fetchJournal: () => Promise<void>
  addJournal: (data: Partial<JournalEntry>) => Promise<void>
}

export const useLifeStore = create<LifeState>((set) => ({
  healthRecords: [],
  habits: [],
  habitLogs: [],
  goals: [],
  journalEntries: [],
  loading: false,

  setHealthRecords: (records) => set({ healthRecords: records }),
  addHealthRecord: (record) =>
    set((state) => ({ healthRecords: [record, ...state.healthRecords] })),
  setHabits: (habits) => set({ habits }),
  addHabitLog: (log) =>
    set((state) => ({ habitLogs: [log, ...state.habitLogs] })),
  setGoals: (goals) => set({ goals }),
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  addJournalEntry: (entry) =>
    set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),
  setLoading: (loading) => set({ loading }),

  fetchHealth: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.life.listHealth()
      const records = (result as unknown as Array<Record<string, unknown>>).map(mapHealthFromDb)
      set({ healthRecords: records, loading: false })
    } catch (error) {
      console.error('Failed to fetch health records:', error)
      set({ loading: false })
    }
  },

  addHealth: async (data) => {
    const result = await window.panorama.life.addHealth(data)
    const mapped = mapHealthFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ healthRecords: [mapped, ...state.healthRecords] }))
  },

  fetchHabits: async () => {
    try {
      const result = await window.panorama.life.listHabits()
      const habits = (result as unknown as Array<Record<string, unknown>>).map(mapHabitFromDb)
      set({ habits })
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    }
  },

  logHabit: async (data) => {
    const result = await window.panorama.life.logHabit(data)
    const mapped = mapHabitLogFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ habitLogs: [mapped, ...state.habitLogs] }))
  },

  fetchGoals: async () => {
    try {
      const result = await window.panorama.life.listGoals()
      const goals = (result as unknown as Array<Record<string, unknown>>).map(mapGoalFromDb)
      set({ goals })
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    }
  },

  fetchJournal: async () => {
    // Journal doesn't have a list handler yet, placeholder
    set({ journalEntries: [] })
  },

  addJournal: async (data) => {
    const result = await window.panorama.life.addJournal(data)
    const mapped = mapJournalFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ journalEntries: [mapped, ...state.journalEntries] }))
  },
}))

function mapHealthFromDb(row: Record<string, unknown>): HealthRecord {
  return {
    id: row.id as string,
    date: row.date as string,
    type: row.type as HealthRecord['type'],
    value: row.value as number,
    unit: row.unit as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

function mapHabitFromDb(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    frequency: row.frequency as Habit['frequency'],
    targetCount: (row.target_count as number) || 1,
    color: row.color as string | undefined,
    icon: row.icon as string | undefined,
    isActive: (row.is_active as number) === 1,
    createdAt: row.created_at as string,
  }
}

function mapHabitLogFromDb(row: Record<string, unknown>): HabitLog {
  return {
    id: row.id as string,
    habitId: row.habit_id as string,
    date: row.date as string,
    count: (row.count as number) || 1,
    notes: row.notes as string | undefined,
  }
}

function mapGoalFromDb(row: Record<string, unknown>): LearningGoal {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    category: row.category as string | undefined,
    targetDate: row.target_date as string | undefined,
    progress: (row.progress as number) || 0,
    status: row.status as LearningGoal['status'],
    resources: safeJsonParse<string[]>(row.resources, []),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapJournalFromDb(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    title: row.title as string | undefined,
    content: row.content as string,
    mood: row.mood as string | undefined,
    tags: safeJsonParse<string[]>(row.tags, []),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
