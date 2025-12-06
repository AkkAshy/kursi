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
  Button,
  Input,
} from '@chakra-ui/react'
import {
  FiSearch,
  FiExternalLink,
  FiEdit,
  FiPause,
  FiPlay,
  FiPhone,
} from 'react-icons/fi'
import api from '@/lib/api'
import { Plan } from '@/types'

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'kursi.uz'

interface TeacherWithSubscription {
  id: number
  subdomain: string
  name: string
  owner: {
    id: number
    username: string
    phone: string
    email?: string
    full_name?: string
  }
  subscription: {
    id: number
    plan: Plan
    status: string
    expires_at?: string
  } | null
  courses_count: number
  students_count: number
  created_at: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherWithSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [teachersData, plansData] = await Promise.all([
        api.getAdminTeachers(),
        api.getPlans(),
      ])
      setTeachers(teachersData)
      setPlans(plansData)
    } catch (error) {
      console.error('Failed to load teachers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePlan = async (tenantId: number, planId: number) => {
    try {
      await api.adminChangePlan(tenantId, planId)
      await loadData()
    } catch (error) {
      console.error('Failed to change plan:', error)
    }
  }

  const handleSuspend = async (tenantId: number) => {
    if (!confirm('Вы уверены, что хотите приостановить подписку?')) return
    try {
      await api.adminSuspendTeacher(tenantId)
      await loadData()
    } catch (error) {
      console.error('Failed to suspend:', error)
    }
  }

  const handleActivate = async (tenantId: number) => {
    try {
      await api.adminActivateTeacher(tenantId)
      await loadData()
    } catch (error) {
      console.error('Failed to activate:', error)
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase()
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subdomain.toLowerCase().includes(query) ||
      teacher.owner.username.toLowerCase().includes(query) ||
      teacher.owner.phone.includes(query)
    )
  })

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
      case 'suspended':
        return 'orange'
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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Активна'
      case 'suspended':
        return 'Приостановлена'
      case 'expired':
        return 'Истекла'
      case 'cancelled':
        return 'Отменена'
      case 'pending':
        return 'Ожидает'
      default:
        return 'Нет'
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
          Учителя
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Управление учителями и их подписками
        </Text>
      </Box>

      {/* Search */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        mb={6}
      >
        <Card.Body p={4}>
          <HStack>
            <Icon as={FiSearch} color="#6F6F6A" />
            <Input
              placeholder="Поиск по имени, телефону или поддомену..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              border="none"
              _focus={{ boxShadow: 'none' }}
              fontSize="14px"
            />
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Teachers Table */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        overflow="hidden"
      >
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="#FAF7F2">
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Учитель
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Поддомен
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Тариф
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Статус
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Курсов
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Студентов
              </Table.ColumnHeader>
              <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                Действия
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTeachers.map((teacher) => (
              <Table.Row key={teacher.id} _hover={{ bg: '#FAF7F2' }}>
                <Table.Cell px={4} py={3}>
                  <VStack align="start" gap={0}>
                    <Text fontSize="14px" fontWeight="500" color="#3E3E3C">
                      {teacher.owner.full_name || teacher.owner.username}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      {teacher.owner.phone}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <HStack gap={1}>
                    <Text fontSize="13px" color="#4C8F6D" fontFamily="mono">
                      {teacher.subdomain}
                    </Text>
                    <Icon
                      as={FiExternalLink}
                      boxSize={3}
                      color="#6F6F6A"
                      cursor="pointer"
                      onClick={() => window.open(`https://${teacher.subdomain}.${BASE_DOMAIN}`, '_blank')}
                    />
                  </HStack>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge colorPalette={getPlanColor(teacher.subscription?.plan?.plan_type)}>
                    {teacher.subscription?.plan?.name || 'Нет'}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Badge colorPalette={getStatusColor(teacher.subscription?.status)}>
                    {getStatusLabel(teacher.subscription?.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="14px" color="#3E3E3C">
                    {teacher.courses_count}
                  </Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <Text fontSize="14px" color="#3E3E3C">
                    {teacher.students_count}
                  </Text>
                </Table.Cell>
                <Table.Cell px={4} py={3}>
                  <HStack gap={2}>
                    <Box position="relative">
                      <select
                        style={{
                          padding: '6px 24px 6px 8px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          border: '1px solid #EFE8E0',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          appearance: 'none',
                        }}
                        value={teacher.subscription?.plan?.id || ''}
                        onChange={(e) => handleChangePlan(teacher.id, Number(e.target.value))}
                      >
                        <option value="" disabled>Выбрать тариф</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                      <Icon
                        as={FiEdit}
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        boxSize={3}
                        color="#6F6F6A"
                        pointerEvents="none"
                      />
                    </Box>
                    {teacher.subscription && (
                      <>
                        {teacher.subscription.status === 'active' ? (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="orange"
                            onClick={() => handleSuspend(teacher.id)}
                            title="Приостановить"
                          >
                            <Icon as={FiPause} />
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="green"
                            onClick={() => handleActivate(teacher.id)}
                            title="Активировать на 31 день"
                          >
                            <Icon as={FiPlay} />
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => window.open(`tel:${teacher.owner.phone}`, '_self')}
                      title={`Позвонить: ${teacher.owner.phone}`}
                    >
                      <Icon as={FiPhone} />
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {filteredTeachers.length === 0 && (
          <Flex justify="center" align="center" py={12}>
            <Text color="#6F6F6A">Учителя не найдены</Text>
          </Flex>
        )}
      </Card.Root>
    </Box>
  )
}
