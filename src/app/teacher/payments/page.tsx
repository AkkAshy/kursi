'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  Badge,
  Button,
  Spinner,
  Image,
  Input,
  Textarea,
  Tabs,
  Flex,
  Icon,
} from '@chakra-ui/react'
import {
  FiCheck,
  FiX,
  FiClock,
  FiPhone,
  FiUser,
  FiBook,
  FiCreditCard,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi'
import api from '@/lib/api'

interface PendingPayment {
  id: number
  purchase_id: number
  student: { id: number; username: string; phone: string }
  course: { id: number; title: string }
  amount: string
  screenshot: string
  student_phone: string
  student_comment?: string
  created_at: string
}

interface PaymentProof extends PendingPayment {
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  admin_comment?: string
  reviewed_by?: string
  reviewed_at?: string
}

interface PaymentSettings {
  card_number: string
  card_holder_name: string
  payment_phone: string
  payment_instructions: string
}

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [allPayments, setAllPayments] = useState<PaymentProof[]>([])
  const [settings, setSettings] = useState<PaymentSettings>({
    card_number: '',
    card_holder_name: '',
    payment_phone: '',
    payment_instructions: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'settings'>('pending')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pending, all, settingsData] = await Promise.all([
        api.getPendingCoursePayments(),
        api.getAllCoursePayments(),
        api.getCreatorPaymentSettings(),
      ])
      setPendingPayments(pending)
      setAllPayments(all)
      setSettings(settingsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (proofId: number) => {
    setProcessingId(proofId)
    try {
      await api.approveCoursePayment(proofId)
      await loadData()
    } catch (error) {
      console.error('Error approving payment:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (proofId: number) => {
    if (!rejectReason.trim()) {
      alert('Укажите причину отклонения')
      return
    }
    setProcessingId(proofId)
    try {
      await api.rejectCoursePayment(proofId, rejectReason)
      setShowRejectModal(null)
      setRejectReason('')
      await loadData()
    } catch (error) {
      console.error('Error rejecting payment:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await api.updateCreatorPaymentSettings(settings)
      alert('Настройки сохранены')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      alert(err.response?.data?.error || 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Платежи студентов</Heading>
          <Text color="gray.600">Проверка оплат и настройки приёма платежей</Text>
        </Box>

        {/* Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => setActiveTab(e.value as 'pending' | 'all' | 'settings')}
        >
          <Tabs.List>
            <Tabs.Trigger value="pending">
              <HStack gap={2}>
                <Icon as={FiClock} />
                <Text>Ожидают проверки</Text>
                {pendingPayments.length > 0 && (
                  <Badge colorPalette="red" borderRadius="full">
                    {pendingPayments.length}
                  </Badge>
                )}
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="all">
              <HStack gap={2}>
                <Icon as={FiCreditCard} />
                <Text>Все платежи</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="settings">
              <HStack gap={2}>
                <Icon as={FiSettings} />
                <Text>Настройки</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Pending Payments */}
          <Tabs.Content value="pending">
            <VStack gap={4} align="stretch" mt={4}>
              {pendingPayments.length === 0 ? (
                <Card.Root p={8}>
                  <VStack>
                    <Icon as={FiCheck} boxSize={12} color="green.500" />
                    <Text fontSize="lg" fontWeight="medium">Нет заявок на проверку</Text>
                    <Text color="gray.500">Все платежи обработаны</Text>
                  </VStack>
                </Card.Root>
              ) : (
                pendingPayments.map((payment) => (
                  <Card.Root key={payment.id} p={4}>
                    <HStack gap={6} align="start" flexWrap="wrap">
                      {/* Screenshot */}
                      <Box flexShrink={0}>
                        {payment.screenshot && (
                          <Image
                            src={payment.screenshot}
                            alt="Скриншот оплаты"
                            maxW="200px"
                            maxH="300px"
                            objectFit="contain"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            cursor="pointer"
                            onClick={() => window.open(payment.screenshot, '_blank')}
                          />
                        )}
                      </Box>

                      {/* Details */}
                      <VStack align="start" gap={3} flex={1}>
                        <HStack gap={2}>
                          <Icon as={FiUser} />
                          <Text fontWeight="medium">{payment.student.username}</Text>
                          <Text color="gray.500">({payment.student.phone})</Text>
                        </HStack>

                        <HStack gap={2}>
                          <Icon as={FiBook} />
                          <Text>{payment.course.title}</Text>
                        </HStack>

                        <HStack gap={2}>
                          <Icon as={FiCreditCard} />
                          <Text fontWeight="bold" fontSize="lg">{payment.amount} сум</Text>
                        </HStack>

                        <HStack gap={2}>
                          <Icon as={FiPhone} />
                          <Text>Телефон для связи: {payment.student_phone}</Text>
                        </HStack>

                        {payment.student_comment && (
                          <HStack gap={2} align="start">
                            <Icon as={FiMessageSquare} mt={1} />
                            <Text color="gray.600">{payment.student_comment}</Text>
                          </HStack>
                        )}

                        <Text fontSize="sm" color="gray.500">
                          Отправлено: {formatDate(payment.created_at)}
                        </Text>
                      </VStack>

                      {/* Actions */}
                      <VStack gap={2}>
                        <Button
                          colorPalette="green"
                          onClick={() => handleApprove(payment.id)}
                          loading={processingId === payment.id}
                          w="full"
                        >
                          <Icon as={FiCheck} mr={2} />
                          Подтвердить
                        </Button>
                        <Button
                          colorPalette="red"
                          variant="outline"
                          onClick={() => setShowRejectModal(payment.id)}
                          disabled={processingId === payment.id}
                          w="full"
                        >
                          <Icon as={FiX} mr={2} />
                          Отклонить
                        </Button>
                      </VStack>
                    </HStack>

                    {/* Reject Modal */}
                    {showRejectModal === payment.id && (
                      <Box mt={4} p={4} bg="red.50" borderRadius="md">
                        <VStack gap={3} align="stretch">
                          <Text fontWeight="medium">Причина отклонения:</Text>
                          <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Укажите причину отклонения..."
                          />
                          <HStack justify="end" gap={2}>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShowRejectModal(null)
                                setRejectReason('')
                              }}
                            >
                              Отмена
                            </Button>
                            <Button
                              colorPalette="red"
                              onClick={() => handleReject(payment.id)}
                              loading={processingId === payment.id}
                            >
                              Отклонить
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                  </Card.Root>
                ))
              )}
            </VStack>
          </Tabs.Content>

          {/* All Payments */}
          <Tabs.Content value="all">
            <VStack gap={4} align="stretch" mt={4}>
              {allPayments.length === 0 ? (
                <Card.Root p={8}>
                  <VStack>
                    <Text fontSize="lg">Нет платежей</Text>
                  </VStack>
                </Card.Root>
              ) : (
                allPayments.map((payment) => (
                  <Card.Root key={payment.id} p={4}>
                    <HStack gap={4} justify="space-between" flexWrap="wrap">
                      <VStack align="start" gap={1}>
                        <HStack gap={2}>
                          <Text fontWeight="medium">{payment.student.username}</Text>
                          <Badge
                            colorPalette={
                              payment.status === 'approved'
                                ? 'green'
                                : payment.status === 'rejected'
                                ? 'red'
                                : 'yellow'
                            }
                          >
                            {payment.status === 'approved'
                              ? 'Подтверждено'
                              : payment.status === 'rejected'
                              ? 'Отклонено'
                              : 'Ожидает'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">{payment.course.title}</Text>
                        <Text fontWeight="bold">{payment.amount} сум</Text>
                        {payment.rejection_reason && (
                          <Text fontSize="sm" color="red.500">
                            Причина: {payment.rejection_reason}
                          </Text>
                        )}
                      </VStack>
                      <VStack align="end" gap={1}>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(payment.created_at)}
                        </Text>
                        {payment.reviewed_at && (
                          <Text fontSize="xs" color="gray.400">
                            Проверено: {formatDate(payment.reviewed_at)}
                          </Text>
                        )}
                        {payment.screenshot && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(payment.screenshot, '_blank')}
                          >
                            Скриншот
                          </Button>
                        )}
                      </VStack>
                    </HStack>
                  </Card.Root>
                ))
              )}
            </VStack>
          </Tabs.Content>

          {/* Settings */}
          <Tabs.Content value="settings">
            <Card.Root p={6} mt={4}>
              <VStack gap={6} align="stretch">
                <Box>
                  <Heading size="md" mb={4}>Настройки приёма платежей</Heading>
                  <Text color="gray.600" mb={6}>
                    Укажите данные карты, на которую студенты будут переводить оплату за курсы
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Номер карты (16 цифр) *</Text>
                  <Input
                    value={formatCardNumber(settings.card_number)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        card_number: e.target.value.replace(/\D/g, '').slice(0, 16),
                      })
                    }
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Имя владельца карты</Text>
                  <Input
                    value={settings.card_holder_name}
                    onChange={(e) =>
                      setSettings({ ...settings, card_holder_name: e.target.value })
                    }
                    placeholder="IVAN IVANOV"
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Телефон для связи</Text>
                  <Input
                    value={settings.payment_phone}
                    onChange={(e) =>
                      setSettings({ ...settings, payment_phone: e.target.value })
                    }
                    placeholder="+998 90 123 45 67"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Студенты смогут позвонить по этому номеру после оплаты
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Инструкции для студентов</Text>
                  <Textarea
                    value={settings.payment_instructions}
                    onChange={(e) =>
                      setSettings({ ...settings, payment_instructions: e.target.value })
                    }
                    placeholder="Переведите указанную сумму на карту и загрузите скриншот чека. После проверки вы получите доступ к курсу."
                    rows={4}
                  />
                </Box>

                <Button
                  colorPalette="blue"
                  onClick={handleSaveSettings}
                  loading={isSaving}
                  alignSelf="start"
                >
                  Сохранить настройки
                </Button>
              </VStack>
            </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Container>
  )
}
