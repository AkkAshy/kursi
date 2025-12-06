'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Flex,
  Card,
  Badge,
  Spinner,
  Button,
} from '@chakra-ui/react'
import {
  FiShoppingBag,
  FiClock,
  FiCheck,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi'
import NextLink from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface Purchase {
  id: number
  course: { id: number; title: string }
  amount: string
  status: 'pending' | 'paid' | 'failed'
  proof_status?: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  admin_comment?: string
  created_at: string
}

export default function StudentPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { user, fetchUser } = useAuthStore()

  // Проверяем авторизацию с задержкой
  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        window.location.href = '/login?redirect=/student/purchases'
        return
      }
      setAuthChecked(true)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!authChecked) return

      try {
        setIsLoading(true)

        // Загружаем пользователя в store если ещё не загружен
        if (!user) {
          await fetchUser()
        }

        const data = await api.getMyPurchases()
        setPurchases(data)
      } catch (err) {
        console.error('Error fetching purchases:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (authChecked) {
      fetchPurchases()
    }
  }, [authChecked, user, fetchUser])

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(parseFloat(price)) + ' сум'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (purchase: Purchase) => {
    if (purchase.status === 'paid') {
      return (
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          fontSize="12px"
          fontWeight="600"
          bg="#E8F5EE"
          color="#4C8F6D"
        >
          <Icon as={FiCheck} mr={1} /> Оплачено
        </Badge>
      )
    }

    if (purchase.proof_status === 'pending') {
      return (
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          fontSize="12px"
          fontWeight="600"
          bg="#FDF6ED"
          color="#C98A4A"
        >
          <Icon as={FiClock} mr={1} /> На проверке
        </Badge>
      )
    }

    if (purchase.proof_status === 'rejected') {
      return (
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          fontSize="12px"
          fontWeight="600"
          bg="#FEE2E2"
          color="#DC2626"
        >
          <Icon as={FiX} mr={1} /> Отклонено
        </Badge>
      )
    }

    return (
      <Badge
        px={3}
        py={1}
        borderRadius="full"
        fontSize="12px"
        fontWeight="600"
        bg="#FDFBF8"
        color="#6F6F6A"
      >
        Ожидает оплаты
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка покупок...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box p={8}>
      {/* Page Header */}
      <Box mb={8}>
          <Heading size="lg" color="#3E3E3C" mb={2}>
            Мои покупки
          </Heading>
          <Text color="#6F6F6A">
            История оплат курсов
          </Text>
        </Box>
        {purchases.length === 0 ? (
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={12}>
              <VStack gap={4}>
                <Flex
                  w={20}
                  h={20}
                  bg="#E8F5EE"
                  borderRadius="20px"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiShoppingBag} boxSize={10} color="#4C8F6D" />
                </Flex>
                <Heading size="md" color="#3E3E3C">
                  Пока нет покупок
                </Heading>
                <Text color="#6F6F6A" textAlign="center" maxW="400px">
                  Вы ещё не приобретали курсы. Найдите интересный курс и начните обучение!
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack gap={4} align="stretch">
            {purchases.map((purchase) => (
              <Card.Root
                key={purchase.id}
                bg="white"
                borderRadius="16px"
                boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
                border="1px solid"
                borderColor="#EFE8E0"
              >
                <Card.Body p={6}>
                  <Flex justify="space-between" align="start" gap={4} flexWrap="wrap">
                    <Box flex={1}>
                      <Text fontSize="16px" fontWeight="600" color="#3E3E3C" mb={2}>
                        {purchase.course.title}
                      </Text>
                      <HStack gap={4} flexWrap="wrap">
                        <Text fontSize="14px" color="#6F6F6A">
                          {formatPrice(purchase.amount)}
                        </Text>
                        <Text fontSize="13px" color="#B5A797">
                          {formatDate(purchase.created_at)}
                        </Text>
                      </HStack>

                      {/* Rejection reason */}
                      {purchase.proof_status === 'rejected' && purchase.rejection_reason && (
                        <Box
                          mt={4}
                          p={4}
                          bg="#FEE2E2"
                          borderRadius="12px"
                        >
                          <HStack gap={2} mb={2}>
                            <Icon as={FiAlertCircle} boxSize={4} color="#DC2626" />
                            <Text fontSize="13px" fontWeight="600" color="#DC2626">
                              Причина отклонения
                            </Text>
                          </HStack>
                          <Text fontSize="14px" color="#7F1D1D">
                            {purchase.rejection_reason}
                          </Text>
                          {purchase.admin_comment && (
                            <Text fontSize="13px" color="#B91C1C" mt={2}>
                              {purchase.admin_comment}
                            </Text>
                          )}
                          <NextLink href={`/courses/${purchase.course.id}/buy`}>
                            <Button
                              size="sm"
                              mt={3}
                              bg="#DC2626"
                              color="white"
                              borderRadius="8px"
                              _hover={{ bg: '#B91C1C' }}
                            >
                              Повторить оплату
                            </Button>
                          </NextLink>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      {getStatusBadge(purchase)}
                    </Box>
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
    </Box>
  )
}
