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
  Table,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FiUsers,
  FiPackage,
} from 'react-icons/fi'
import api from '@/lib/api'
import { Plan, Subscription } from '@/types'

interface SubscriptionStats {
  plan_name: string
  plan_type: string
  count: number
  revenue: number
}

interface ExtendedSubscription {
  id: number
  plan: Plan
  status: string
  started_at: string
  expires_at?: string
  auto_renew: boolean
  tenant_name: string
  tenant_subdomain: string
  owner_name: string
  owner_phone: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ExtendedSubscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subsData, plansData, statsData] = await Promise.all([
        api.getAdminSubscriptions(),
        api.getPlans(),
        api.getAdminSubscriptionStats(),
      ])
      setSubscriptions(subsData)
      setPlans(plansData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const getPlanColor = (planType?: string) => {
    switch (planType) {
      case 'starter':
        return 'gray'
      case 'pro':
        return 'blue'
      case 'business':
        return 'purple'
      case 'enterprise':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'expired':
        return 'red'
      case 'cancelled':
        return 'gray'
      case 'pending':
        return 'yellow'
      default:
        return 'gray'
    }
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
          Подписки
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Статистика по тарифам
        </Text>
      </Box>

      {/* Stats by Plan */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={8}>
        {plans.map((plan) => {
          const planStats = stats.find((s) => s.plan_type === plan.plan_type)
          return (
            <Card.Root
              key={plan.id}
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
            >
              <Card.Body p={5}>
                <VStack align="start" gap={3}>
                  <HStack justify="space-between" w="100%">
                    <Badge colorPalette={getPlanColor(plan.plan_type)} size="lg">
                      {plan.name}
                    </Badge>
                    <Icon as={FiPackage} color="#6F6F6A" />
                  </HStack>
                  <Box>
                    <Text fontSize="24px" fontWeight="bold" color="#3E3E3C">
                      {planStats?.count || 0}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      активных подписок
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="14px" fontWeight="600" color="#4C8F6D">
                      {formatNumber(planStats?.revenue || 0)} сум
                    </Text>
                    <Text fontSize="11px" color="#6F6F6A">
                      доход за месяц
                    </Text>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          )
        })}
      </SimpleGrid>

      {/* Subscriptions Table */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        overflow="hidden"
      >
        <Box p={4} borderBottom="1px solid" borderColor="#EFE8E0">
          <Heading as="h3" fontSize="16px" color="#3E3E3C">
            Все подписки
          </Heading>
        </Box>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="#FAF7F2">
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Учитель
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Тариф
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Статус
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Начало
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Истекает
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Авто-продление
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {subscriptions.map((sub) => (
              <Table.Row key={sub.id} _hover={{ bg: '#FAF7F2' }}>
                <Table.Cell px={4} py={3}>
                  <VStack align="start" gap={0}>
                    <Text fontSize="14px" fontWeight="500" color="#3E3E3C">
                      {sub.tenant_name}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      {sub.owner_phone}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge colorPalette={getPlanColor(sub.plan?.plan_type)}>
                    {sub.plan?.name}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge colorPalette={getStatusColor(sub.status)}>
                    {sub.status === 'active' ? 'Активна' :
                     sub.status === 'expired' ? 'Истекла' :
                     sub.status === 'cancelled' ? 'Отменена' :
                     sub.status === 'pending' ? 'Ожидает' : sub.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="13px" color="#6F6F6A">
                    {formatDate(sub.started_at)}
                  </Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="13px" color={sub.expires_at ? '#3E3E3C' : '#6F6F6A'}>
                    {sub.expires_at ? formatDate(sub.expires_at) : 'Бессрочно'}
                  </Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge colorPalette={sub.auto_renew ? 'green' : 'gray'}>
                    {sub.auto_renew ? 'Да' : 'Нет'}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {subscriptions.length === 0 && (
          <Flex justify="center" align="center" py={12}>
            <Text color="#6F6F6A">Подписки не найдены</Text>
          </Flex>
        )}
      </Card.Root>
    </Box>
  )
}
