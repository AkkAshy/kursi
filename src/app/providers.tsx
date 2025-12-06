'use client'

import { useEffect } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@/theme'
import { useAuthStore } from '@/stores/authStore'
import { Toaster } from '@/components/ui/toaster'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // При загрузке страницы проверяем токен и загружаем пользователя
    if (isAuthenticated) {
      fetchUser()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <Toaster />
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </ChakraProvider>
  )
}
