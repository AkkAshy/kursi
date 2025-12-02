import { create } from 'zustand'
import { Lesson, LessonMaterial } from '@/types'
import api from '@/lib/api'

interface LessonsState {
  lessons: Lesson[]
  currentLesson: Lesson | null
  isLoading: boolean
  error: string | null

  fetchLessons: (courseId: number) => Promise<void>
  fetchLesson: (id: number) => Promise<Lesson>
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
  updateLesson: (id: number, data: {
    title?: string
    description?: string
    text_content?: string
    video?: File
    homework_required?: boolean
    homework_description?: string
  }) => Promise<void>
  deleteLesson: (id: number) => Promise<void>
  uploadMaterial: (lessonId: number, file: File, title?: string) => Promise<LessonMaterial>
  deleteMaterial: (lessonId: number, materialId: number) => Promise<void>
  clearLessons: () => void
  clearError: () => void
}

export const useLessonsStore = create<LessonsState>((set, get) => ({
  lessons: [],
  currentLesson: null,
  isLoading: false,
  error: null,

  fetchLessons: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const lessons = await api.getLessons(courseId)
      set({ lessons, isLoading: false })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки уроков',
        isLoading: false,
      })
    }
  },

  fetchLesson: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const lesson = await api.getLesson(id)
      set({ currentLesson: lesson, isLoading: false })
      return lesson
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки урока',
        isLoading: false,
      })
      throw err
    }
  },

  createLesson: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const lesson = await api.createLesson(data)
      set((state) => ({
        lessons: [...state.lessons, lesson].sort((a, b) => a.order_index - b.order_index),
        isLoading: false,
      }))
      return lesson
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка создания урока',
        isLoading: false,
      })
      throw err
    }
  },

  updateLesson: async (id: number, data) => {
    set({ isLoading: true, error: null })
    try {
      const updatedLesson = await api.updateLesson(id, data)
      set((state) => ({
        lessons: state.lessons
          .map((l) => (l.id === id ? updatedLesson : l))
          .sort((a, b) => a.order_index - b.order_index),
        currentLesson: state.currentLesson?.id === id ? updatedLesson : state.currentLesson,
        isLoading: false,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка обновления урока',
        isLoading: false,
      })
      throw err
    }
  },

  deleteLesson: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteLesson(id)
      set((state) => ({
        lessons: state.lessons.filter((l) => l.id !== id),
        isLoading: false,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка удаления урока',
        isLoading: false,
      })
      throw err
    }
  },

  uploadMaterial: async (lessonId: number, file: File, title?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.uploadLessonMaterial(lessonId, file, title)
      const material = response.material as LessonMaterial
      // Update lesson in the list with new material
      set((state) => ({
        lessons: state.lessons.map((l) => {
          if (l.id === lessonId) {
            return {
              ...l,
              materials: [...(l.materials || []), material],
            }
          }
          return l
        }),
        currentLesson: state.currentLesson?.id === lessonId
          ? {
              ...state.currentLesson,
              materials: [...(state.currentLesson.materials || []), material],
            }
          : state.currentLesson,
        isLoading: false,
      }))
      return material
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка загрузки материала',
        isLoading: false,
      })
      throw err
    }
  },

  deleteMaterial: async (lessonId: number, materialId: number) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteLessonMaterial(lessonId, materialId)
      set((state) => ({
        lessons: state.lessons.map((l) => {
          if (l.id === lessonId) {
            return {
              ...l,
              materials: (l.materials || []).filter((m) => m.id !== materialId),
            }
          }
          return l
        }),
        currentLesson: state.currentLesson?.id === lessonId
          ? {
              ...state.currentLesson,
              materials: (state.currentLesson.materials || []).filter((m) => m.id !== materialId),
            }
          : state.currentLesson,
        isLoading: false,
      }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      set({
        error: error.response?.data?.detail || 'Ошибка удаления материала',
        isLoading: false,
      })
      throw err
    }
  },

  clearLessons: () => {
    set({ lessons: [], currentLesson: null, error: null })
  },

  clearError: () => set({ error: null }),
}))
