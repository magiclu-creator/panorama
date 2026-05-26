import { create } from 'zustand'
import type { SolarProject, SolarStage, StageHistoryEntry } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface SolarState {
  projects: SolarProject[]
  selectedProject: SolarProject | null
  loading: boolean
  filter: {
    stage?: SolarStage
    search?: string
  }

  setProjects: (projects: SolarProject[]) => void
  addProject: (project: SolarProject) => void
  updateProject: (id: string, updates: Partial<SolarProject>) => void
  removeProject: (id: string) => void
  setSelectedProject: (project: SolarProject | null) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: Partial<SolarState['filter']>) => void
  fetchProjects: () => Promise<void>
  createProject: (data: Partial<SolarProject>) => Promise<SolarProject>
  updateProjectRemote: (id: string, updates: Partial<SolarProject>) => Promise<void>
  updateStage: (id: string, stage: SolarStage) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useSolarStore = create<SolarState>((set, get) => ({
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
      const result = await window.panorama.solar.list()
      const projects = (result as unknown as Array<Record<string, unknown>>).map(mapSolarFromDb)
      set({ projects, loading: false })
    } catch (error) {
      console.error('Failed to fetch solar projects:', error)
      set({ loading: false })
    }
  },

  createProject: async (data) => {
    const result = await window.panorama.solar.create(data)
    const mapped = mapSolarFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ projects: [mapped, ...state.projects] }))
    return mapped
  },

  updateProjectRemote: async (id, updates) => {
    await window.panorama.solar.update(id, updates)
    get().updateProject(id, updates)
  },

  updateStage: async (id, stage) => {
    await window.panorama.solar.updateStage(id, stage)
    // Refresh the project to get updated stage history
    const result = await window.panorama.solar.get(id)
    if (result) {
      const mapped = mapSolarFromDb(result as unknown as Record<string, unknown>)
      get().updateProject(id, mapped)
    }
  },

  deleteProject: async (id) => {
    try {
      // @ts-expect-error - solar:delete will be added in next IPC update
      await window.panorama.solar.delete?.(id)
    } catch {
      // Handler may not exist yet
    }
    get().removeProject(id)
  },
}))

function mapSolarFromDb(row: Record<string, unknown>): SolarProject {
  return {
    id: row.id as string,
    projectId: row.project_id as string | undefined,
    customerId: row.customer_id as string | undefined,
    projectName: row.project_name as string,
    systemType: row.system_type as SolarProject['systemType'],
    capacity: (row.capacity as number) || 0,
    panelCount: (row.panel_count as number) || 0,
    panelModel: row.panel_model as string | undefined,
    inverterModel: row.inverter_model as string | undefined,
    mountingType: row.mounting_type as SolarProject['mountingType'],
    roofArea: row.roof_area as number | undefined,
    roofOrientation: row.roof_orientation as string | undefined,
    roofTilt: row.roof_tilt as number | undefined,
    shadingAnalysis: safeJsonParse<Record<string, unknown> | undefined>(row.shading_analysis, undefined),
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    address: row.address as string | undefined,
    stage: row.stage as SolarStage,
    stageHistory: safeJsonParse<StageHistoryEntry[]>(row.stage_history, []),
    contractAmount: (row.contract_amount as number) || 0,
    estimatedGeneration: (row.estimated_generation as number) || 0,
    actualGeneration: (row.actual_generation as number) || 0,
    commissioningDate: row.commissioning_date as string | undefined,
    acceptanceDate: row.acceptance_date as string | undefined,
    warrantyExpiry: row.warranty_expiry as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
