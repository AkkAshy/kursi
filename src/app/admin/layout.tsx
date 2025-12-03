'use client'

import { Box, Flex } from '@chakra-ui/react'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    if (!isLoading && (!user || !isAdminOrManager)) {
      router.push('/login')
    }
  }, [user, isLoading, router, isAdminOrManager])

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <Box>Загрузка...</Box>
      </Flex>
    )
  }

  if (!user || !isAdminOrManager) {
    return null
  }

  return (
    <Flex minH="100vh" bg="#FAF7F2">
      <AdminSidebar />
      <Box
        as="main"
        ml="260px"
        flex={1}
        p={8}
        minH="100vh"
      >
        {children}
      </Box>
    </Flex>
  )
}
