'use client'

import { Toaster as ChakraToaster, Portal, Spinner, Stack, Toast, createToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
})

export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ base: '4', md: '8' }}>
        {(toast) => (
          <Toast.Root>
            {toast.type === 'loading' ? (
              <Spinner size="sm" color="blue.500" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
            </Stack>
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
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
      duration: undefined,
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
