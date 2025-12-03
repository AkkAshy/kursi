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

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <Box>Загрузка...</Box>
      </Flex>
    )
  }

  if (!user || user.role !== 'admin') {
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
