import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { AuthTokens, User, Course, BotLead, CreatorProfile, Lesson, Plan, Subscription, SubscriptionUsage, SubscriptionPayment, PaymentSettings, ManualPayment, ChangePlanResponse, AdminNotification } from '@/types'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_BASE_URL = 'https://kursi.erp-imaster.uz/api'


class ApiClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        // Add tenant header if subdomain exists
        if (typeof window !== 'undefined') {
          const subdomain = this.getSubdomain()
          if (subdomain) {
            config.headers['X-Tenant'] = subdomain
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`
            return this.client(originalRequest)
          } catch {
            this.logout()
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return Promise.reject(error)
          }
        }

        return Promise.reject(error)
      }
    )

    // Load tokens from localStorage on init
    if (typeof window !== 'undefined') {
      this.loadTokens()
    }
  }

  private getSubdomain(): string | null {
    if (typeof window === 'undefined') return null
    const hostname = window.location.hostname

    // Игнорируем localhost, vercel и другие не-продакшен домены
    if (
      hostname === 'localhost' ||
      hostname.includes('vercel.app') ||
      hostname.includes('127.0.0.1')
    ) {
      return null
    }

    const parts = hostname.split('.')
    // Проверяем что это поддомен kursi.uz или erp-imaster.uz
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0]
    }
    return null
  }

  private loadTokens() {
    const tokens = localStorage.getItem('auth_tokens')
    if (tokens) {
      const parsed: AuthTokens = JSON.parse(tokens)
      this.accessToken = parsed.access
      this.refreshToken = parsed.refresh
    }
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access
    this.refreshToken = tokens.refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
    }
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token')
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh: this.refreshToken,
    })

    this.accessToken = response.data.access
    if (typeof window !== 'undefined') {
      const tokens = { access: this.accessToken!, refresh: this.refreshToken! }
      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
    }
  }

  logout() {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('user')
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  // ==================== AUTH ====================

  async login(login: string, password: string): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>('/auth/login/', { login, password })
    this.setTokens(response.data)
    return response.data
  }

  async register(data: {
    phone: string
    username: string
    full_name?: string
    email?: string
    password: string
    password_confirm: string
    role: 'creator' | 'student'
  }): Promise<{ user: User; tokens: AuthTokens }> {
    // Удаляем undefined поля перед отправкой
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )
    const response = await this.client.post('/users/', cleanData)
    if (response.data.tokens) {
      this.setTokens(response.data.tokens)
    }
    return response.data
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/users/me/')
    return response.data
  }

  // ==================== COURSES ====================

  async getCourses(): Promise<Course[]> {
    const response = await this.client.get<{ results: Course[] } | Course[]>('/courses/')
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getMyCourses(): Promise<Course[]> {
    const response = await this.client.get<{ results: Course[] } | Course[]>('/courses/my_courses/')
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getCourse(id: number): Promise<Course> {
    const response = await this.client.get<Course>(`/courses/${id}/`)
    return response.data
  }

  async createCourse(data: {
    title: string
    description?: string
    price: number
    trial_text?: string
    trial_video?: File
  }): Promise<Course> {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('price', data.price.toString())
    if (data.trial_text) formData.append('trial_text', data.trial_text)
    if (data.trial_video) formData.append('trial_video', data.trial_video)

    const response = await this.client.post<Course>('/courses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await this.client.patch<Course>(`/courses/${id}/`, data)
    return response.data
  }

  async deleteCourse(id: number): Promise<void> {
    await this.client.delete(`/courses/${id}/`)
  }

  async publishCourse(id: number): Promise<{ message: string; course: Course }> {
    const response = await this.client.post(`/courses/${id}/publish/`)
    return response.data
  }

  async unpublishCourse(id: number): Promise<{ message: string; course: Course }> {
    const response = await this.client.post(`/courses/${id}/unpublish/`)
    return response.data
  }

  async getCourseStudents(id: number): Promise<{
    course: string
    total_students: number
    students: Array<{
      id: number
      username: string
      phone: string
      granted_at: string
      progress_percentage: number
      completed_lessons: number
    }>
  }> {
    const response = await this.client.get(`/courses/${id}/students/`)
    return response.data
  }

  async getCourseStatistics(id: number): Promise<{
    course: Course
    statistics: {
      total_students: number
      total_revenue: number
      total_lessons: number
      average_progress_percentage: number
    }
  }> {
    const response = await this.client.get(`/courses/${id}/statistics/`)
    return response.data
  }

  async getPublicCourses(): Promise<Course[]> {
    const response = await this.client.get<{ results: Course[] } | Course[]>('/courses/public/')
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getPublicCourse(id: number): Promise<{
    id: number
    title: string
    description?: string
    price: number
    cover_url?: string
    preview_video_url?: string
    lessons_count: number
    students_count: number
    creator: {
      id: number
      username: string
      full_name?: string
    }
    created_at: string
  }> {
    const response = await this.client.get(`/courses/${id}/public_detail/`)
    return response.data
  }

  async getStudentCourses(): Promise<Array<{
    id: number
    title: string
    description?: string
    cover_url?: string
    lessons_count: number
    creator: {
      id: number
      username: string
      full_name?: string
    }
    progress_percentage: number
    completed_lessons: number
    granted_at: string
  }>> {
    const response = await this.client.get('/courses/student_courses/')
    return response.data
  }

  // ==================== LESSONS ====================

  async getLessons(courseId: number): Promise<Lesson[]> {
    const response = await this.client.get<{ results: Lesson[] } | Lesson[]>(`/lessons/?course=${courseId}`)
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getLesson(id: number): Promise<Lesson> {
    const response = await this.client.get<Lesson>(`/lessons/${id}/`)
    return response.data
  }

  async createLesson(data: {
    course: number
    title: string
    order_index: number
    description?: string
    text_content?: string
    video?: File
    homework_required?: boolean
    homework_description?: string
  }): Promise<Lesson> {
    const formData = new FormData()
    formData.append('course', data.course.toString())
    formData.append('title', data.title)
    formData.append('order_index', data.order_index.toString())
    if (data.description) formData.append('description', data.description)
    if (data.text_content) formData.append('text_content', data.text_content)
    if (data.video) formData.append('video', data.video)
    if (data.homework_required) formData.append('homework_required', 'true')
    if (data.homework_description) formData.append('homework_description', data.homework_description)

    const response = await this.client.post<Lesson>('/lessons/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateLesson(id: number, data: {
    title?: string
    description?: string
    text_content?: string
    video?: File
    homework_required?: boolean
    homework_description?: string
  }): Promise<Lesson> {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.description !== undefined) formData.append('description', data.description || '')
    if (data.text_content !== undefined) formData.append('text_content', data.text_content || '')
    if (data.video) formData.append('video', data.video)
    if (data.homework_required !== undefined) formData.append('homework_required', data.homework_required ? 'true' : 'false')
    if (data.homework_description !== undefined) formData.append('homework_description', data.homework_description || '')

    const response = await this.client.patch<Lesson>(`/lessons/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteLesson(id: number): Promise<void> {
    await this.client.delete(`/lessons/${id}/`)
  }

  async uploadLessonMaterial(lessonId: number, file: File, title?: string): Promise<{ message: string; material: { id: number; title: string; file: string; created_at: string } }> {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)

    const response = await this.client.post(`/lessons/${lessonId}/upload_material/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteLessonMaterial(lessonId: number, materialId: number): Promise<void> {
    await this.client.delete(`/lessons/${lessonId}/material/${materialId}/`)
  }

  // ==================== BOT LEADS ====================

  async getLeads(status?: string): Promise<BotLead[]> {
    const params = status ? `?status=${status}` : ''
    const response = await this.client.get<{ results: BotLead[] } | BotLead[]>(`/bot-leads/${params}`)
    // Handle both paginated and non-paginated responses
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getMyLeads(status?: string): Promise<BotLead[]> {
    const params = status ? `?status=${status}` : ''
    const response = await this.client.get<{ results: BotLead[] } | BotLead[]>(`/creator-profile/my_leads/${params}`)
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async updateLeadStatus(id: number, status: BotLead['status']): Promise<BotLead> {
    const response = await this.client.patch<BotLead>(`/bot-leads/${id}/update_status/`, { status })
    return response.data
  }

  // ==================== CREATOR PROFILE ====================

  async getCreatorProfile(): Promise<CreatorProfile> {
    const response = await this.client.get<CreatorProfile>('/creator-profile/me/')
    return response.data
  }

  async regenerateReferralKey(): Promise<{
    message: string
    referral_key: string
    bot_link: string
  }> {
    const response = await this.client.post('/creator-profile/regenerate_referral_key/')
    return response.data
  }

  async purchaseTariff(tariffId: number): Promise<{
    message: string
    profile: CreatorProfile
  }> {
    const response = await this.client.post('/creator-profile/purchase_tariff/', {
      tariff_id: tariffId,
    })
    return response.data
  }

  // ==================== TENANT ====================

  async getTenantInfo(): Promise<{
    id: number
    subdomain: string
    name: string
    creator: User
  }> {
    const response = await this.client.get('/tenant/info/')
    return response.data
  }

  // ==================== SUBSCRIPTIONS ====================

  async getPlans(): Promise<Plan[]> {
    const response = await this.client.get<{ results: Plan[] } | Plan[]>('/plans/')
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  }

  async comparePlans(): Promise<Plan[]> {
    const response = await this.client.get<{ results: Plan[] } | Plan[]>('/plans/compare/')
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  }

  async getCurrentSubscription(): Promise<Subscription> {
    const response = await this.client.get<Subscription>('/subscription/current/')
    return response.data
  }

  async getSubscriptionUsage(): Promise<SubscriptionUsage> {
    const response = await this.client.get<SubscriptionUsage>('/subscription/usage/')
    return response.data
  }

  async changePlan(planId: number): Promise<ChangePlanResponse> {
    const response = await this.client.post<ChangePlanResponse>('/subscription/change_plan/', {
      plan_id: planId,
    })
    return response.data
  }

  async cancelSubscription(): Promise<{
    message: string
    subscription: Subscription
  }> {
    const response = await this.client.post('/subscription/cancel/')
    return response.data
  }

  async getSubscriptionPayments(): Promise<SubscriptionPayment[]> {
    const response = await this.client.get<SubscriptionPayment[]>('/subscription/payments/')
    return response.data
  }

  // ==================== MANUAL PAYMENTS ====================

  async getPaymentInfo(): Promise<PaymentSettings> {
    const response = await this.client.get<PaymentSettings>('/manual-payments/payment_info/')
    return response.data
  }

  async submitManualPayment(planId: number, screenshot: File, comment?: string): Promise<{
    message: string
    payment: ManualPayment
  }> {
    const formData = new FormData()
    formData.append('plan_id', planId.toString())
    formData.append('screenshot', screenshot)
    if (comment) formData.append('comment', comment)

    const response = await this.client.post('/manual-payments/submit/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getMyManualPayments(): Promise<ManualPayment[]> {
    const response = await this.client.get<ManualPayment[]>('/manual-payments/my_payments/')
    return response.data
  }

  async getManualPaymentStatus(id: number): Promise<ManualPayment> {
    const response = await this.client.get<ManualPayment>(`/manual-payments/${id}/status/`)
    return response.data
  }

  // ==================== COURSE PAYMENTS (для оплаты курсов студентами) ====================

  // Для учителя: настройки оплаты
  async getCreatorPaymentSettings(): Promise<{
    card_number: string
    card_holder_name: string
    payment_phone: string
    payment_instructions: string
  }> {
    const response = await this.client.get('/creator-payments/settings/')
    return response.data
  }

  async updateCreatorPaymentSettings(data: {
    card_number?: string
    card_holder_name?: string
    payment_phone?: string
    payment_instructions?: string
  }): Promise<{
    message: string
    card_number: string
    card_holder_name: string
    payment_phone: string
    payment_instructions: string
  }> {
    const response = await this.client.put('/creator-payments/settings/', data)
    return response.data
  }

  // Для учителя: просмотр платежей
  async getPendingCoursePayments(): Promise<Array<{
    id: number
    purchase_id: number
    student: { id: number; username: string; phone: string }
    course: { id: number; title: string }
    amount: string
    screenshot: string
    student_phone: string
    student_comment?: string
    created_at: string
  }>> {
    const response = await this.client.get('/creator-payments/pending/')
    return response.data
  }

  async getAllCoursePayments(): Promise<Array<{
    id: number
    purchase_id: number
    student: { id: number; username: string; phone: string }
    course: { id: number; title: string }
    amount: string
    screenshot: string
    student_phone: string
    student_comment?: string
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    admin_comment?: string
    reviewed_by?: string
    reviewed_at?: string
    created_at: string
  }>> {
    const response = await this.client.get('/creator-payments/all/')
    return response.data
  }

  async approveCoursePayment(proofId: number, comment?: string): Promise<{ message: string; status: string }> {
    const response = await this.client.post(`/creator-payments/${proofId}/approve/`, { comment })
    return response.data
  }

  async rejectCoursePayment(proofId: number, reason: string, comment?: string): Promise<{ message: string; status: string }> {
    const response = await this.client.post(`/creator-payments/${proofId}/reject/`, { reason, comment })
    return response.data
  }

  // Для студента: оплата курса
  async getCoursePaymentInfo(courseId: number): Promise<{
    course: { id: number; title: string; price: string }
    payment_info: {
      card_number: string
      card_number_formatted: string
      card_holder_name: string
      payment_phone: string
      instructions: string
    }
  }> {
    const response = await this.client.get(`/course-payments/${courseId}/payment-info/`)
    return response.data
  }

  async submitCoursePayment(courseId: number, screenshot: File, studentPhone: string, comment?: string): Promise<{
    message: string
    purchase_id: number
    status: string
  }> {
    const formData = new FormData()
    formData.append('screenshot', screenshot)
    formData.append('student_phone', studentPhone)
    if (comment) formData.append('comment', comment)

    const response = await this.client.post(`/course-payments/${courseId}/submit-payment/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getMyPurchases(): Promise<Array<{
    id: number
    course: { id: number; title: string }
    amount: string
    status: 'pending' | 'paid' | 'failed'
    proof_status?: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    admin_comment?: string
    created_at: string
  }>> {
    const response = await this.client.get('/course-payments/my-purchases/')
    return response.data
  }

  // ==================== ADMIN ====================

  async getAdminStats(): Promise<{
    total_teachers: number
    total_students: number
    total_courses: number
    total_revenue: number
    pending_payments: number
    active_subscriptions: number
  }> {
    const response = await this.client.get('/admin/stats/')
    return response.data
  }

  async getAdminTeachers(): Promise<Array<{
    id: number
    subdomain: string
    name: string
    owner: {
      id: number
      username: string
      phone: string
      email?: string
      full_name?: string
    }
    subscription: {
      id: number
      plan: Plan
      status: string
      expires_at?: string
    } | null
    courses_count: number
    students_count: number
    created_at: string
  }>> {
    const response = await this.client.get('/admin/teachers/')
    return response.data
  }

  async adminChangePlan(tenantId: number, planId: number): Promise<{ message: string }> {
    const response = await this.client.post(`/admin/teachers/${tenantId}/change-plan/`, {
      plan_id: planId,
    })
    return response.data
  }

  async getAdminPendingPayments(): Promise<ManualPayment[]> {
    const response = await this.client.get('/admin/payments/pending/')
    return response.data
  }

  async getAdminAllPayments(): Promise<ManualPayment[]> {
    const response = await this.client.get('/admin/payments/all/')
    return response.data
  }

  async adminApprovePayment(paymentId: number, comment?: string): Promise<{ message: string }> {
    const response = await this.client.post(`/admin/payments/${paymentId}/approve/`, { comment })
    return response.data
  }

  async adminRejectPayment(paymentId: number, comment: string): Promise<{ message: string }> {
    const response = await this.client.post(`/admin/payments/${paymentId}/reject/`, { comment })
    return response.data
  }

  async getAdminSubscriptions(): Promise<Array<{
    id: number
    plan: Plan
    status: string
    started_at: string
    expires_at?: string
    auto_renew: boolean
    tenant_name: string
    tenant_subdomain: string
    owner_name: string
    owner_phone: string
  }>> {
    const response = await this.client.get('/admin/subscriptions/')
    return response.data
  }

  async getAdminSubscriptionStats(): Promise<Array<{
    plan_name: string
    plan_type: string
    count: number
    revenue: number
  }>> {
    const response = await this.client.get('/admin/subscriptions/stats/')
    return response.data
  }

  async getAdminPaymentSettings(): Promise<{
    card_number: string
    card_holder_name: string
    manager_phone: string
    manager_telegram: string
    instructions: string
  }> {
    const response = await this.client.get('/admin/payments/settings/')
    return response.data
  }

  async updateAdminPaymentSettings(data: {
    card_number?: string
    card_holder_name?: string
    manager_phone?: string
    manager_telegram?: string
    instructions?: string
  }): Promise<{ message: string }> {
    const response = await this.client.post('/admin/payments/update_settings/', data)
    return response.data
  }

  // Admin Notifications
  async getAdminNotifications(): Promise<AdminNotification[]> {
    const response = await this.client.get('/admin/notifications/')
    return response.data
  }

  async getAdminNotificationsUnreadCount(): Promise<{ count: number }> {
    const response = await this.client.get('/admin/notifications/unread-count/')
    return response.data
  }

  async markNotificationRead(id: number): Promise<{ message: string }> {
    const response = await this.client.post(`/admin/notifications/${id}/read/`)
    return response.data
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const response = await this.client.post('/admin/notifications/read-all/')
    return response.data
  }

  async checkOverduePayments(): Promise<{ message: string; created_count: number }> {
    const response = await this.client.post('/admin/notifications/check-overdue/')
    return response.data
  }

  // Admin Teacher Actions
  async adminSuspendTeacher(tenantId: number): Promise<{ message: string }> {
    const response = await this.client.post(`/admin/teachers/${tenantId}/suspend/`)
    return response.data
  }

  async adminActivateTeacher(tenantId: number): Promise<{ message: string; expires_at: string }> {
    const response = await this.client.post(`/admin/teachers/${tenantId}/activate/`)
    return response.data
  }
}

export const api = new ApiClient()
export default api
