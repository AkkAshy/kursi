'use client'

import { useEffect, useState } from 'react'
import { Flex, Spinner, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/StudentSidebar'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, fetchUser } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!api.isAuthenticated()) {
        router.push('/login?redirect=/student')
        return
      }

      try {
        if (!user) {
          await fetchUser()
        }
        const currentUser = useAuthStore.getState().user
        if (currentUser?.role !== 'student') {
          // Редирект для не-студентов
          if (currentUser?.role === 'creator') {
            router.push('/teacher')
          } else if (currentUser?.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/login')
          }
          return
        }
      } catch {
        router.push('/login?redirect=/student')
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [user, fetchUser, router])

  if (isChecking) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <Spinner size="xl" color="#4C8F6D" />
      </Flex>
    )
  }

  return (
    <Flex minH="100vh" bg="#FAF7F2">
      <StudentSidebar />
      <Box
        flex={1}
        ml={{ base: 0, md: '260px' }}
        p={{ base: 4, md: 8 }}
        pt={{ base: '70px', md: 8 }}
      >
        {children}
      </Box>
    </Flex>
  )
}
