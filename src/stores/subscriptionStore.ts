import { create } from 'zustand'
import { Plan, Subscription, SubscriptionUsage, SubscriptionPayment, PaymentSettings, ManualPayment, ChangePlanResponse } from '@/types'
import api from '@/lib/api'

interface SubscriptionState {
  plans: Plan[]
  currentSubscription: Subscription | null
  usage: SubscriptionUsage | null
  payments: SubscriptionPayment[]
  manualPayments: ManualPayment[]
  paymentInfo: PaymentSettings | null
  pendingPlanChange: ChangePlanResponse | null
  isLoading: boolean
  error: string | null

  fetchPlans: () => Promise<void>
  fetchCurrentSubscription: () => Promise<void>
  fetchUsage: () => Promise<void>
  fetchPayments: () => Promise<void>
  fetchManualPayments: () => Promise<void>
  fetchPaymentInfo: () => Promise<void>
  changePlan: (planId: number) => Promise<{ success: boolean; needsPayment?: boolean; paymentData?: ChangePlanResponse }>
  submitPaymentScreenshot: (planId: number, screenshot: File, comment?: string) => Promise<{ success: boolean; payment?: ManualPayment }>
  cancelSubscription: () => Promise<void>
  clearError: () => void
  clearPendingPlanChange: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plans: [],
  currentSubscription: null,
  usage: null,
  payments: [],
  manualPayments: [],
  paymentInfo: null,
  pendingPlanChange: null,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true, error: null })
    try {
      const plans = await api.comparePlans()
      set({ plans, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки тарифов',
        isLoading: false,
      })
    }
  },

  fetchCurrentSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      const subscription = await api.getCurrentSubscription()
      set({ currentSubscription: subscription, isLoading: false })
    } catch {
      // Если нет подписки, это нормально
      set({ currentSubscription: null, isLoading: false })
    }
  },

  fetchUsage: async () => {
    set({ isLoading: true, error: null })
    try {
      const usage = await api.getSubscriptionUsage()
      set({ usage, currentSubscription: usage.subscription, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchPayments: async () => {
    try {
      const payments = await api.getSubscriptionPayments()
      set({ payments })
    } catch {
      set({ payments: [] })
    }
  },

  fetchManualPayments: async () => {
    try {
      const manualPayments = await api.getMyManualPayments()
      set({ manualPayments })
    } catch {
      set({ manualPayments: [] })
    }
  },

  fetchPaymentInfo: async () => {
    try {
      const paymentInfo = await api.getPaymentInfo()
      set({ paymentInfo })
    } catch {
      set({ paymentInfo: null })
    }
  },

  changePlan: async (planId: number) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.changePlan(planId)

      // Если план изменён (бесплатный или downgrade)
      if (result.subscription) {
        set({ currentSubscription: result.subscription, isLoading: false, pendingPlanChange: null })
        return { success: true }
      }

      // Если нужна оплата (платный план)
      if (result.payment_info && result.new_plan) {
        set({ isLoading: false, pendingPlanChange: result })
        return {
          success: true,
          needsPayment: true,
          paymentData: result,
        }
      }

      set({ isLoading: false })
      return { success: true }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; error?: string } } }
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Ошибка смены тарифа'
      set({ error: errorMessage, isLoading: false })
      return { success: false }
    }
  },

  submitPaymentScreenshot: async (planId: number, screenshot: File, comment?: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.submitManualPayment(planId, screenshot, comment)
      set({ isLoading: false, pendingPlanChange: null })
      return { success: true, payment: result.payment }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; error?: string } } }
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Ошибка отправки платежа'
      set({ error: errorMessage, isLoading: false })
      return { success: false }
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.cancelSubscription()
      set({ currentSubscription: result.subscription, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка отмены подписки',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  clearPendingPlanChange: () => set({ pendingPlanChange: null }),
}))
