import { create } from 'zustand'
import type { Project, ProjectStatus } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  loading: boolean
  filter: {
    status?: ProjectStatus
    search?: string
  }

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setSelectedProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: Partial<ProjectState['filter']>) => void
  fetchProjects: () => Promise<void>
  createProject: (data: Partial<Project>) => Promise<Project>
  updateProjectRemote: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  filter: {},

  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
    })),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setLoading: (loading) => set({ loading }),
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.projects.list()
      const projects = (result as unknown as Array<Record<string, unknown>>).map(mapProjectFromDb)
      set({ projects, loading: false })
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      set({ loading: false })
    }
  },

  createProject: async (data) => {
    const result = await window.panorama.projects.create(data)
    const mapped = mapProjectFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ projects: [mapped, ...state.projects] }))
    return mapped
  },

  updateProjectRemote: async (id, updates) => {
    await window.panorama.projects.update(id, updates)
    get().updateProject(id, updates)
  },

  deleteProject: async (id) => {
    await window.panorama.projects.delete(id)
    get().removeProject(id)
  },
}))

function mapProjectFromDb(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    status: row.status as ProjectStatus,
    priority: row.priority as Project['priority'],
    startDate: row.start_date as string | undefined,
    endDate: row.end_date as string | undefined,
    budget: (row.budget as number) || 0,
    spent: (row.spent as number) || 0,
    progress: (row.progress as number) || 0,
    customerId: row.customer_id as string | undefined,
    tags: safeJsonParse<string[]>(row.tags, []),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
