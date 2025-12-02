import { create } from 'zustand'
import { BotLead } from '@/types'
import api from '@/lib/api'

interface LeadsState {
  leads: BotLead[]
  isLoading: boolean
  error: string | null
  statusFilter: string | null

  fetchLeads: (status?: string) => Promise<void>
  updateLeadStatus: (id: number, status: BotLead['status']) => Promise<void>
  setStatusFilter: (status: string | null) => void
  clearError: () => void
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  statusFilter: null,

  fetchLeads: async (status?: string) => {
    set({ isLoading: true, error: null })
    try {
      const leads = await api.getLeads(status)
      set({ leads, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки лидов',
        isLoading: false,
      })
    }
  },

  updateLeadStatus: async (id: number, status: BotLead['status']) => {
    try {
      const updatedLead = await api.updateLeadStatus(id, status)
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      set({ error: error.response?.data?.error || 'Ошибка обновления статуса' })
      throw err
    }
  },

  setStatusFilter: (status: string | null) => {
    set({ statusFilter: status })
    get().fetchLeads(status || undefined)
  },

  clearError: () => set({ error: null }),
}))
