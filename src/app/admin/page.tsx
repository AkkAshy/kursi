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
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FiUsers,
  FiBook,
  FiDollarSign,
  FiPackage,
} from 'react-icons/fi'
import api from '@/lib/api'

interface AdminStats {
  total_teachers: number
  total_students: number
  total_courses: number
  total_revenue: number
  pending_payments: number
  active_subscriptions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Set default stats if API fails
      setStats({
        total_teachers: 0,
        total_students: 0,
        total_courses: 0,
        total_revenue: 0,
        pending_payments: 0,
        active_subscriptions: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="#C98A4A" />
      </Flex>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading
          as="h1"
          fontSize="28px"
          fontWeight="bold"
          color="#3E3E3C"
          letterSpacing="-0.5px"
          mb={2}
        >
          Панель администратора
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Общая статистика платформы
        </Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
        {/* Teachers */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Учителей
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                  {formatNumber(stats?.total_teachers || 0)}
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#E8F5EE"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiUsers} boxSize={6} color="#4C8F6D" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Students */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Студентов
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                  {formatNumber(stats?.total_students || 0)}
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#FDF6ED"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiUsers} boxSize={6} color="#C98A4A" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Courses */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Курсов
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                  {formatNumber(stats?.total_courses || 0)}
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#E8F0F5"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiBook} boxSize={6} color="#4A7C8F" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Revenue */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Общий доход
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                  {formatNumber(stats?.total_revenue || 0)} сум
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#E8F5EE"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiDollarSign} boxSize={6} color="#4C8F6D" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Pending Payments */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Ожидают проверки
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#C98A4A">
                  {formatNumber(stats?.pending_payments || 0)}
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#FDF6ED"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiDollarSign} boxSize={6} color="#C98A4A" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Active Subscriptions */}
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Text fontSize="13px" color="#6F6F6A">
                  Активных подписок
                </Text>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                  {formatNumber(stats?.active_subscriptions || 0)}
                </Text>
              </VStack>
              <Flex
                w={12}
                h={12}
                bg="#F0E8F5"
                borderRadius="12px"
                align="center"
                justify="center"
              >
                <Icon as={FiPackage} boxSize={6} color="#8F4C8F" />
              </Flex>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  )
}
