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
  Image,
  Tabs,
} from '@chakra-ui/react'
import {
  FiCheck,
  FiX,
  FiEye,
  FiClock,
} from 'react-icons/fi'
import api from '@/lib/api'
import { ManualPayment } from '@/types'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<ManualPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadPayments()
  }, [filter])

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const data = filter === 'pending'
        ? await api.getAdminPendingPayments()
        : await api.getAdminAllPayments()
      setPayments(data)
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (paymentId: number) => {
    setActionLoading(paymentId)
    try {
      await api.adminApprovePayment(paymentId)
      await loadPayments()
      setSelectedPayment(null)
    } catch (error) {
      console.error('Failed to approve payment:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (paymentId: number) => {
    const comment = prompt('Причина отклонения:')
    if (!comment) return

    setActionLoading(paymentId)
    try {
      await api.adminRejectPayment(paymentId, comment)
      await loadPayments()
      setSelectedPayment(null)
    } catch (error) {
      console.error('Failed to reject payment:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge colorPalette="yellow">Ожидает</Badge>
      case 'approved':
        return <Badge colorPalette="green">Подтверждён</Badge>
      case 'rejected':
        return <Badge colorPalette="red">Отклонён</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
          Платежи
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Проверка платежей за подписки
        </Text>
      </Box>

      {/* Tabs */}
      <HStack gap={4} mb={6}>
        <Button
          size="sm"
          bg={filter === 'pending' ? '#C98A4A' : 'white'}
          color={filter === 'pending' ? 'white' : '#6F6F6A'}
          border="1px solid"
          borderColor={filter === 'pending' ? '#C98A4A' : '#EFE8E0'}
          borderRadius="10px"
          onClick={() => setFilter('pending')}
          _hover={{
            bg: filter === 'pending' ? '#B57A3A' : '#FAF7F2',
          }}
        >
          <Icon as={FiClock} mr={2} />
          Ожидают проверки
        </Button>
        <Button
          size="sm"
          bg={filter === 'all' ? '#C98A4A' : 'white'}
          color={filter === 'all' ? 'white' : '#6F6F6A'}
          border="1px solid"
          borderColor={filter === 'all' ? '#C98A4A' : '#EFE8E0'}
          borderRadius="10px"
          onClick={() => setFilter('all')}
          _hover={{
            bg: filter === 'all' ? '#B57A3A' : '#FAF7F2',
          }}
        >
          Все платежи
        </Button>
      </HStack>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="#C98A4A" />
        </Flex>
      ) : (
        <Flex gap={6}>
          {/* Payments List */}
          <Card.Root
            flex={2}
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
                    Дата
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                    Учитель
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                    Тариф
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                    Сумма
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                    Статус
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} fontSize="12px" color="#6F6F6A" fontWeight="600">
                    Действия
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {payments.map((payment) => (
                  <Table.Row
                    key={payment.id}
                    _hover={{ bg: '#FAF7F2' }}
                    bg={selectedPayment?.id === payment.id ? '#FAF7F2' : 'transparent'}
                    cursor="pointer"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <Table.Cell px={4} py={3}>
                      <Text fontSize="13px" color="#6F6F6A">
                        {formatDate(payment.created_at)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Text fontSize="14px" fontWeight="500" color="#3E3E3C">
                        {payment.reviewed_by_name || 'Учитель'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Badge colorPalette="blue">{payment.plan?.name}</Badge>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
                        {formatNumber(payment.amount)} сум
                      </Text>
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      {getStatusBadge(payment.status)}
                    </Table.Cell>
                    <Table.Cell px={4} py={3}>
                      {payment.status === 'pending' && (
                        <HStack gap={2}>
                          <Button
                            size="xs"
                            colorPalette="green"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(payment.id)
                            }}
                            loading={actionLoading === payment.id}
                          >
                            <Icon as={FiCheck} />
                          </Button>
                          <Button
                            size="xs"
                            colorPalette="red"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(payment.id)
                            }}
                            loading={actionLoading === payment.id}
                          >
                            <Icon as={FiX} />
                          </Button>
                        </HStack>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

            {payments.length === 0 && (
              <Flex justify="center" align="center" py={12}>
                <Text color="#6F6F6A">
                  {filter === 'pending' ? 'Нет платежей на проверку' : 'Платежи не найдены'}
                </Text>
              </Flex>
            )}
          </Card.Root>

          {/* Payment Details */}
          {selectedPayment && (
            <Card.Root
              flex={1}
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              position="sticky"
              top={8}
              h="fit-content"
            >
              <Card.Body p={6}>
                <VStack align="stretch" gap={4}>
                  <Heading as="h3" fontSize="16px" color="#3E3E3C">
                    Детали платежа
                  </Heading>

                  {/* Screenshot */}
                  {selectedPayment.screenshot && (
                    <Box
                      borderRadius="12px"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="#EFE8E0"
                    >
                      <Image
                        src={selectedPayment.screenshot}
                        alt="Скриншот оплаты"
                        w="100%"
                        cursor="pointer"
                        onClick={() => window.open(selectedPayment.screenshot, '_blank')}
                      />
                    </Box>
                  )}

                  {/* Details */}
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="#6F6F6A">Тариф:</Text>
                      <Text fontSize="13px" fontWeight="600" color="#3E3E3C">
                        {selectedPayment.plan?.name}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="#6F6F6A">Сумма:</Text>
                      <Text fontSize="13px" fontWeight="600" color="#3E3E3C">
                        {formatNumber(selectedPayment.amount)} сум
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="#6F6F6A">Статус:</Text>
                      {getStatusBadge(selectedPayment.status)}
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="#6F6F6A">Дата:</Text>
                      <Text fontSize="13px" color="#3E3E3C">
                        {formatDate(selectedPayment.created_at)}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Comment */}
                  {selectedPayment.user_comment && (
                    <Box bg="#FAF7F2" p={3} borderRadius="10px">
                      <Text fontSize="12px" color="#6F6F6A" mb={1}>
                        Комментарий:
                      </Text>
                      <Text fontSize="13px" color="#3E3E3C">
                        {selectedPayment.user_comment}
                      </Text>
                    </Box>
                  )}

                  {/* Admin Comment */}
                  {selectedPayment.admin_comment && (
                    <Box bg="#FDF6ED" p={3} borderRadius="10px">
                      <Text fontSize="12px" color="#C98A4A" mb={1}>
                        Ответ админа:
                      </Text>
                      <Text fontSize="13px" color="#3E3E3C">
                        {selectedPayment.admin_comment}
                      </Text>
                    </Box>
                  )}

                  {/* Actions */}
                  {selectedPayment.status === 'pending' && (
                    <HStack gap={3} pt={2}>
                      <Button
                        flex={1}
                        bg="#4C8F6D"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#3F7A5C' }}
                        onClick={() => handleApprove(selectedPayment.id)}
                        loading={actionLoading === selectedPayment.id}
                      >
                        <Icon as={FiCheck} mr={2} />
                        Подтвердить
                      </Button>
                      <Button
                        flex={1}
                        bg="white"
                        color="#C98A4A"
                        border="1px solid"
                        borderColor="#C98A4A"
                        borderRadius="10px"
                        _hover={{ bg: '#FDF6ED' }}
                        onClick={() => handleReject(selectedPayment.id)}
                        loading={actionLoading === selectedPayment.id}
                      >
                        <Icon as={FiX} mr={2} />
                        Отклонить
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </Flex>
      )}
    </Box>
  )
}
