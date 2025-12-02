import { create } from 'zustand'
import { Course, Lesson } from '@/types'
import api from '@/lib/api'

interface CoursesState {
  courses: Course[]
  currentCourse: Course | null
  lessons: Lesson[]
  isLoading: boolean
  error: string | null

  fetchMyCourses: () => Promise<void>
  fetchCourse: (id: number) => Promise<void>
  fetchLessons: (courseId: number) => Promise<void>
  createCourse: (data: {
    title: string
    description?: string
    price: number
    trial_text?: string
    trial_video?: File
  }) => Promise<Course>
  updateCourse: (id: number, data: Partial<Course>) => Promise<void>
  deleteCourse: (id: number) => Promise<void>
  publishCourse: (id: number) => Promise<void>
  unpublishCourse: (id: number) => Promise<void>
  createLesson: (data: {
    course: number
    title: string
    order_index: number
    description?: string
    text_content?: string
    video?: File
    homework_required?: boolean
    homework_description?: string
  }) => Promise<Lesson>
  updateLesson: (id: number, data: Partial<Lesson>) => Promise<void>
  deleteLesson: (id: number) => Promise<void>
  clearError: () => void
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  currentCourse: null,
  lessons: [],
  isLoading: false,
  error: null,

  fetchMyCourses: async () => {
    set({ isLoading: true, error: null })
    try {
      const courses = await api.getMyCourses()
      set({ courses, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки курсов',
        isLoading: false,
      })
    }
  },

  fetchCourse: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const course = await api.getCourse(id)
      set({ currentCourse: course, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки курса',
        isLoading: false,
      })
    }
  },

  fetchLessons: async (courseId: number) => {
    try {
      const lessons = await api.getLessons(courseId)
      set({ lessons })
    } catch (err: unknown) {
      console.error('Error fetching lessons:', err)
    }
  },

  createCourse: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const course = await api.createCourse(data)
      set((state) => ({
        courses: [...state.courses, course],
        isLoading: false,
      }))
      return course
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка создания курса',
        isLoading: false,
      })
      throw err
    }
  },

  updateCourse: async (id: number, data: Partial<Course>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCourse = await api.updateCourse(id, data)
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? updatedCourse : c)),
        currentCourse: state.currentCourse?.id === id ? updatedCourse : state.currentCourse,
        isLoading: false,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка обновления курса',
        isLoading: false,
      })
      throw err
    }
  },

  deleteCourse: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteCourse(id)
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
        isLoading: false,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка удаления курса',
        isLoading: false,
      })
      throw err
    }
  },

  publishCourse: async (id: number) => {
    try {
      const response = await api.publishCourse(id)
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? response.course : c)),
        currentCourse: state.currentCourse?.id === id ? response.course : state.currentCourse,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      set({ error: error.response?.data?.error || 'Ошибка публикации' })
      throw err
    }
  },

  unpublishCourse: async (id: number) => {
    try {
      const response = await api.unpublishCourse(id)
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? response.course : c)),
        currentCourse: state.currentCourse?.id === id ? response.course : state.currentCourse,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      set({ error: error.response?.data?.error || 'Ошибка снятия с публикации' })
      throw err
    }
  },

  createLesson: async (data) => {
    try {
      const lesson = await api.createLesson(data)
      set((state) => ({
        lessons: [...state.lessons, lesson].sort((a, b) => a.order_index - b.order_index),
      }))
      return lesson
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({ error: error.response?.data?.detail || 'Ошибка создания урока' })
      throw err
    }
  },

  updateLesson: async (id: number, data: Partial<Lesson>) => {
    try {
      const updatedLesson = await api.updateLesson(id, data)
      set((state) => ({
        lessons: state.lessons.map((l) => (l.id === id ? updatedLesson : l)),
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({ error: error.response?.data?.detail || 'Ошибка обновления урока' })
      throw err
    }
  },

  deleteLesson: async (id: number) => {
    try {
      await api.deleteLesson(id)
      set((state) => ({
        lessons: state.lessons.filter((l) => l.id !== id),
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({ error: error.response?.data?.detail || 'Ошибка удаления урока' })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
