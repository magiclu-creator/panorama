import { create } from 'zustand'
import type { Customer, CustomerType, CustomerStatus } from '../../shared/types'
import { safeJsonParse } from '../lib/json'

interface CustomerState {
  customers: Customer[]
  selectedCustomer: Customer | null
  loading: boolean
  filter: {
    type?: CustomerType
    status?: CustomerStatus
    search?: string
  }

  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: Partial<CustomerState['filter']>) => void
  fetchCustomers: () => Promise<void>
  createCustomer: (data: Partial<Customer>) => Promise<Customer>
  updateCustomerRemote: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  searchCustomers: (query: string) => Promise<void>
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  filter: {},

  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === id
          ? { ...state.selectedCustomer, ...updates }
          : state.selectedCustomer,
    })),
  removeCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      selectedCustomer:
        state.selectedCustomer?.id === id ? null : state.selectedCustomer,
    })),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setLoading: (loading) => set({ loading }),
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  fetchCustomers: async () => {
    set({ loading: true })
    try {
      const result = await window.panorama.customers.list()
      const customers = (result as unknown as Array<Record<string, unknown>>).map(mapCustomerFromDb)
      set({ customers, loading: false })
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      set({ loading: false })
    }
  },

  createCustomer: async (data) => {
    const result = await window.panorama.customers.create(data)
    const mapped = mapCustomerFromDb(result as unknown as Record<string, unknown>)
    set((state) => ({ customers: [mapped, ...state.customers] }))
    return mapped
  },

  updateCustomerRemote: async (id, updates) => {
    await window.panorama.customers.update(id, updates)
    get().updateCustomer(id, updates)
  },

  deleteCustomer: async (id) => {
    await window.panorama.customers.delete(id)
    get().removeCustomer(id)
  },

  searchCustomers: async (query) => {
    set({ loading: true })
    try {
      const result = await window.panorama.customers.search(query)
      const customers = (result as unknown as Array<Record<string, unknown>>).map(mapCustomerFromDb)
      set({ customers, loading: false })
    } catch (error) {
      console.error('Failed to search customers:', error)
      set({ loading: false })
    }
  },
}))

function mapCustomerFromDb(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    company: row.company as string | undefined,
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    address: row.address as string | undefined,
    type: row.type as CustomerType,
    status: row.status as CustomerStatus,
    source: row.source as Customer['source'],
    tags: safeJsonParse<string[]>(row.tags, []),
    notes: row.notes as string | undefined,
    aiScore: (row.ai_score as number) || 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
