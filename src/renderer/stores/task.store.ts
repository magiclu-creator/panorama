import { create } from 'zustand'
import type { Task, TaskStatus, TaskPriority } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  loading: boolean
  filter: {
    status?: TaskStatus
    priority?: TaskPriority
    search?: string
  }

  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setSelectedTask: (task: Task | null) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: Partial<TaskState['filter']>) => void
  fetchTasks: () => Promise<void>
  createTask: (task: Partial<Task>) => Promise<Task>
  updateTaskRemote: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,
  filter: {},

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setLoading: (loading) => set({ loading }),
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.tasks.list()
      const tasks = (result as unknown as Array<Record<string, unknown>>).map(mapTaskFromDb)
      set({ tasks, loading: false })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      set({ loading: false })
    }
  },

  createTask: async (taskData) => {
    const result = await window.panorama.tasks.create(taskData)
    const mapped = mapTaskFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ tasks: [mapped, ...state.tasks] }))
    return mapped
  },

  updateTaskRemote: async (id, updates) => {
    await window.panorama.tasks.update(id, updates)
    get().updateTask(id, updates)
  },

  deleteTask: async (id) => {
    await window.panorama.tasks.delete(id)
    get().removeTask(id)
  },
}))

function mapTaskFromDb(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date as string | undefined,
    completedAt: row.completed_at as string | undefined,
    isRecurring: (row.is_recurring as number) === 1,
    recurrenceRule: row.recurrence_rule as string | undefined,
    parentTaskId: row.parent_task_id as string | undefined,
    projectId: row.project_id as string | undefined,
    customerId: row.customer_id as string | undefined,
    tags: safeJsonParse<string[]>(row.tags, []),
    aiClassified: (row.ai_classified as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
