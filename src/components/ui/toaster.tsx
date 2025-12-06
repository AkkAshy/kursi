'use client'

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-right',
  pauseOnPageIdle: true,
})

export function Toaster() {
  return (
    <ChakraToaster
      toaster={toaster}
      insetInline={{ base: '4', md: '8' }}
    />
  )
}

// Helper functions for common toast types
export const toast = {
  success: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'success',
      duration: 4000,
    })
  },

  error: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'error',
      duration: 5000,
    })
  },

  warning: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'warning',
      duration: 4000,
    })
  },

  info: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'info',
      duration: 4000,
    })
  },

  loading: (title: string, description?: string) => {
    return toaster.create({
      title,
      description,
      type: 'loading',
      duration: null,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toaster.promise(promise, {
      loading: { title: options.loading },
      success: { title: options.success },
      error: { title: options.error },
    })
  },
}
