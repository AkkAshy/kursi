'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Flex,
  Button,
  Card,
  Badge,
  Spinner,
  Textarea,
  Image,
} from '@chakra-ui/react'
import {
  FiCheck,
  FiX,
  FiZap,
  FiStar,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiUpload,
  FiCreditCard,
  FiPhone,
  FiCopy,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { Plan, ChangePlanResponse, ManualPayment } from '@/types'

const planIcons: Record<string, React.ElementType> = {
  starter: FiZap,
  pro: FiStar,
  business: FiTrendingUp,
  enterprise: FiTarget,
}

const planColors: Record<string, string> = {
  starter: '#6F6F6A',
  pro: '#4C8F6D',
  business: '#C98A4A',
  enterprise: '#8B5CF6',
}

function formatPrice(price: number): string {
  if (price === 0) return 'Бесплатно'
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум/мес'
}

function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  isLoading,
}: {
  plan: Plan
  isCurrentPlan: boolean
  onSelect: () => void
  isLoading: boolean
}) {
  const PlanIcon = planIcons[plan.plan_type] || FiZap
  const color = planColors[plan.plan_type] || '#4C8F6D'

  const features = [
    { label: 'Свой логотип', enabled: plan.can_custom_logo },
    { label: 'Цветовая схема', enabled: plan.can_custom_colors },
    { label: 'Кастомные шрифты', enabled: plan.can_custom_fonts },
    { label: 'CSS редактор', enabled: plan.can_custom_css },
    { label: 'Свой домен', enabled: plan.can_custom_domain },
    { label: 'Убрать брендинг', enabled: plan.can_remove_branding },
    { label: 'Email уведомления', enabled: plan.can_email_notifications },
    { label: 'Расширенная аналитика', enabled: plan.can_advanced_analytics },
    { label: 'Экспорт данных', enabled: plan.can_export_data },
    { label: 'Приоритетная поддержка', enabled: plan.has_priority_support },
  ]

  return (
    <Card.Root
      bg="white"
      borderRadius="20px"
      border="2px solid"
      borderColor={isCurrentPlan ? color : '#EFE8E0'}
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ borderColor: color, transform: 'translateY(-4px)' }}
      position="relative"
    >
      {isCurrentPlan && (
        <Box
          position="absolute"
          top={4}
          right={4}
          bg={color}
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="11px"
          fontWeight="600"
        >
          Текущий
        </Box>
      )}

      <Card.Body p={6}>
        <VStack align="stretch" gap={5}>
          {/* Header */}
          <Box textAlign="center">
            <Flex
              w={14}
              h={14}
              bg={`${color}15`}
              borderRadius="16px"
              align="center"
              justify="center"
              mx="auto"
              mb={3}
            >
              <Icon as={PlanIcon} boxSize={7} color={color} />
            </Flex>
            <Heading size="md" color="#3E3E3C" mb={1}>
              {plan.name}
            </Heading>
            <Text fontSize="28px" fontWeight="bold" color={color}>
              {formatPrice(plan.price)}
            </Text>
          </Box>

          {/* Features */}
          <VStack align="stretch" gap={2}>
            {features.map((feature, idx) => (
              <HStack key={idx} gap={2}>
                <Icon
                  as={feature.enabled ? FiCheck : FiX}
                  boxSize={4}
                  color={feature.enabled ? '#4C8F6D' : '#C9BDB0'}
                />
                <Text
                  fontSize="13px"
                  color={feature.enabled ? '#3E3E3C' : '#B5A797'}
                >
                  {feature.label}
                </Text>
              </HStack>
            ))}
          </VStack>

          {/* Button */}
          <Button
            w="full"
            bg={isCurrentPlan ? '#EFE8E0' : color}
            color={isCurrentPlan ? '#6F6F6A' : 'white'}
            borderRadius="12px"
            fontSize="14px"
            fontWeight="600"
            py={6}
            onClick={onSelect}
            disabled={isCurrentPlan || isLoading}
            _hover={{ opacity: isCurrentPlan ? 1 : 0.9 }}
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : isCurrentPlan ? (
              'Текущий тариф'
            ) : plan.price === 0 ? (
              'Выбрать'
            ) : (
              'Перейти'
            )}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

// Модальное окно оплаты
function PaymentModal({
  paymentData,
  onClose,
  onSubmit,
  isLoading,
}: {
  paymentData: ChangePlanResponse
  onClose: () => void
  onSubmit: (screenshot: File, comment?: string) => void
  isLoading: boolean
}) {
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCopyCard = () => {
    if (paymentData.payment_info?.card_number_formatted) {
      navigator.clipboard.writeText(paymentData.payment_info.card_number_formatted.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = () => {
    if (screenshot) {
      onSubmit(screenshot, comment || undefined)
    }
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Card.Root
        bg="white"
        borderRadius="20px"
        maxW="500px"
        w="full"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card.Header p={6} pb={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="#3E3E3C">
              Оплата тарифа {paymentData.new_plan?.name}
            </Heading>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon as={FiX} />
            </Button>
          </Flex>
        </Card.Header>

        <Card.Body p={6} pt={0}>
          <VStack gap={6} align="stretch">
            {/* Сумма */}
            <Box
              bg="#F8F5F0"
              borderRadius="12px"
              p={4}
              textAlign="center"
            >
              <Text fontSize="14px" color="#6F6F6A" mb={1}>К оплате:</Text>
              <Text fontSize="32px" fontWeight="bold" color="#4C8F6D">
                {formatPrice(paymentData.amount || 0)}
              </Text>
            </Box>

            {/* Данные для оплаты */}
            <VStack gap={4} align="stretch">
              {/* Номер карты */}
              <Box>
                <HStack gap={2} mb={2}>
                  <Icon as={FiCreditCard} color="#6F6F6A" />
                  <Text fontSize="14px" fontWeight="500" color="#3E3E3C">
                    Номер карты
                  </Text>
                </HStack>
                <Flex
                  bg="#F8F5F0"
                  borderRadius="10px"
                  p={3}
                  align="center"
                  justify="space-between"
                >
                  <Text fontSize="18px" fontWeight="600" color="#3E3E3C" letterSpacing="1px">
                    {paymentData.payment_info?.card_number_formatted || '—'}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCard}
                    color={copied ? '#4C8F6D' : '#6F6F6A'}
                  >
                    <Icon as={copied ? FiCheck : FiCopy} />
                  </Button>
                </Flex>
                {paymentData.payment_info?.card_holder_name && (
                  <Text fontSize="12px" color="#6F6F6A" mt={1}>
                    {paymentData.payment_info.card_holder_name}
                  </Text>
                )}
              </Box>

              {/* Телефон менеджера */}
              {paymentData.payment_info?.manager_phone && (
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiPhone} color="#6F6F6A" />
                    <Text fontSize="14px" fontWeight="500" color="#3E3E3C">
                      Телефон менеджера
                    </Text>
                  </HStack>
                  <Text fontSize="16px" color="#3E3E3C">
                    {paymentData.payment_info.manager_phone}
                  </Text>
                </Box>
              )}

              {/* Инструкции */}
              {paymentData.instructions && (
                <Box
                  bg="#FDF6ED"
                  borderRadius="10px"
                  p={4}
                >
                  <HStack gap={2} mb={2}>
                    <Icon as={FiAlertCircle} color="#C98A4A" />
                    <Text fontSize="13px" fontWeight="500" color="#C98A4A">
                      Инструкция
                    </Text>
                  </HStack>
                  <Text fontSize="13px" color="#8B7355">
                    {paymentData.instructions}
                  </Text>
                </Box>
              )}
            </VStack>

            {/* Загрузка скриншота */}
            <Box>
              <Text fontSize="14px" fontWeight="500" color="#3E3E3C" mb={3}>
                Загрузите скриншот чека об оплате
              </Text>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {previewUrl ? (
                <Box
                  position="relative"
                  borderRadius="12px"
                  overflow="hidden"
                  border="2px solid #EFE8E0"
                >
                  <Image
                    src={previewUrl}
                    alt="Скриншот чека"
                    maxH="200px"
                    w="full"
                    objectFit="contain"
                    bg="#F8F5F0"
                  />
                  <Button
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    bg="white"
                    borderRadius="full"
                    onClick={() => {
                      setScreenshot(null)
                      setPreviewUrl(null)
                    }}
                  >
                    <Icon as={FiX} />
                  </Button>
                </Box>
              ) : (
                <Flex
                  border="2px dashed #C9BDB0"
                  borderRadius="12px"
                  p={8}
                  align="center"
                  justify="center"
                  flexDirection="column"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: '#4C8F6D', bg: '#F8F5F0' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon as={FiUpload} boxSize={8} color="#6F6F6A" mb={2} />
                  <Text fontSize="14px" color="#6F6F6A" textAlign="center">
                    Нажмите или перетащите файл
                  </Text>
                  <Text fontSize="12px" color="#B5A797" mt={1}>
                    PNG, JPG до 10MB
                  </Text>
                </Flex>
              )}
            </Box>

            {/* Комментарий */}
            <Box>
              <Text fontSize="14px" fontWeight="500" color="#3E3E3C" mb={2}>
                Комментарий (необязательно)
              </Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например, дата и время перевода..."
                borderRadius="10px"
                borderColor="#EFE8E0"
                _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                resize="none"
                rows={2}
              />
            </Box>

            {/* Кнопка отправки */}
            <Button
              w="full"
              bg="#4C8F6D"
              color="white"
              borderRadius="12px"
              fontSize="14px"
              fontWeight="600"
              py={6}
              onClick={handleSubmit}
              disabled={!screenshot || isLoading}
              _hover={{ opacity: 0.9 }}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              {isLoading ? <Spinner size="sm" /> : 'Отправить на проверку'}
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

// Уведомление об успешной отправке
function PaymentSuccessNotification({ payment, onClose }: { payment: ManualPayment; onClose: () => void }) {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Card.Root
        bg="white"
        borderRadius="20px"
        maxW="400px"
        w="full"
        onClick={(e) => e.stopPropagation()}
      >
        <Card.Body p={8} textAlign="center">
          <Flex
            w={16}
            h={16}
            bg="#E8F5EE"
            borderRadius="full"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
          >
            <Icon as={FiCheckCircle} boxSize={8} color="#4C8F6D" />
          </Flex>

          <Heading size="md" color="#3E3E3C" mb={2}>
            Заявка отправлена!
          </Heading>

          <Text fontSize="14px" color="#6F6F6A" mb={6}>
            Ваш скриншот отправлен на проверку. Мы уведомим вас о результате в ближайшее время.
          </Text>

          <HStack gap={2} justify="center" mb={6}>
            <Icon as={FiClock} color="#C98A4A" />
            <Text fontSize="13px" color="#C98A4A">
              Обычно проверка занимает до 24 часов
            </Text>
          </HStack>

          <Button
            w="full"
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            onClick={onClose}
          >
            Понятно
          </Button>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

export default function SettingsPage() {
  const {
    plans,
    currentSubscription,
    pendingPlanChange,
    isLoading,
    error,
    fetchPlans,
    changePlan,
    submitPaymentScreenshot,
    clearError,
    clearPendingPlanChange,
  } = useSubscriptionStore()

  const [mounted, setMounted] = useState(false)
  const [changingPlan, setChangingPlan] = useState<number | null>(null)
  const [successPayment, setSuccessPayment] = useState<ManualPayment | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchPlans()
    }
  }, [mounted, fetchPlans])

  const handleSelectPlan = async (plan: Plan) => {
    setChangingPlan(plan.id)
    await changePlan(plan.id)
    // Если needsPayment, модальное окно откроется автоматически через pendingPlanChange
    setChangingPlan(null)
  }

  const handleSubmitPayment = async (screenshot: File, comment?: string) => {
    if (!pendingPlanChange?.new_plan) return

    const result = await submitPaymentScreenshot(pendingPlanChange.new_plan.id, screenshot, comment)

    if (result.success && result.payment) {
      setSuccessPayment(result.payment)
    }
  }

  if (!mounted) {
    return (
      <Flex minH="400px" align="center" justify="center">
        <Spinner size="xl" color="#4C8F6D" />
      </Flex>
    )
  }

  return (
    <Box maxW="1200px">
      {/* Header */}
      <Box mb={8}>
        <Heading
          as="h1"
          fontSize="24px"
          fontWeight="bold"
          color="#3E3E3C"
          letterSpacing="-0.3px"
          mb={2}
        >
          Настройки
        </Heading>
        <Text fontSize="14px" color="#6F6F6A">
          Управление подпиской и тарифом
        </Text>
      </Box>

      {/* Error */}
      {error && (
        <Flex
          bg="#FDF6ED"
          borderRadius="12px"
          p={4}
          align="center"
          gap={3}
          mb={6}
        >
          <Icon as={FiAlertCircle} color="#C98A4A" boxSize={5} />
          <Text fontSize="14px" color="#C98A4A" flex={1}>
            {error}
          </Text>
          <Button size="sm" variant="ghost" color="#C98A4A" onClick={clearError}>
            Закрыть
          </Button>
        </Flex>
      )}

      {/* Current Subscription Info */}
      {currentSubscription && (
        <Card.Root
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="#EFE8E0"
          mb={8}
        >
          <Card.Body p={6}>
            <Flex justify="space-between" align="center">
              <HStack gap={4}>
                <Flex
                  w={12}
                  h={12}
                  bg={`${planColors[currentSubscription.plan.plan_type]}15`}
                  borderRadius="12px"
                  align="center"
                  justify="center"
                >
                  <Icon
                    as={planIcons[currentSubscription.plan.plan_type] || FiZap}
                    boxSize={6}
                    color={planColors[currentSubscription.plan.plan_type]}
                  />
                </Flex>
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="#3E3E3C">
                    Тариф {currentSubscription.plan.name}
                  </Text>
                  <HStack gap={2}>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="11px"
                      bg={currentSubscription.is_active ? '#E8F5EE' : '#FDF6ED'}
                      color={currentSubscription.is_active ? '#4C8F6D' : '#C98A4A'}
                    >
                      {currentSubscription.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                    {currentSubscription.days_remaining !== null &&
                      currentSubscription.days_remaining !== undefined && (
                        <Text fontSize="12px" color="#6F6F6A">
                          Осталось {currentSubscription.days_remaining} дней
                        </Text>
                      )}
                  </HStack>
                </Box>
              </HStack>

              <Text fontSize="20px" fontWeight="bold" color="#3E3E3C">
                {formatPrice(currentSubscription.plan.price)}
              </Text>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* Plans */}
      <Box mb={8}>
        <Heading size="md" color="#3E3E3C" mb={6}>
          Выберите тариф
        </Heading>

        {isLoading && plans.length === 0 ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="#4C8F6D" />
          </Flex>
        ) : (
          <Flex gap={6} flexWrap="wrap">
            {plans.map((plan) => (
              <Box key={plan.id} flex="1" minW="260px" maxW="300px">
                <PlanCard
                  plan={plan}
                  isCurrentPlan={currentSubscription?.plan.id === plan.id}
                  onSelect={() => handleSelectPlan(plan)}
                  isLoading={changingPlan === plan.id}
                />
              </Box>
            ))}
          </Flex>
        )}
      </Box>

      {/* Payment Modal */}
      {pendingPlanChange && (
        <PaymentModal
          paymentData={pendingPlanChange}
          onClose={clearPendingPlanChange}
          onSubmit={handleSubmitPayment}
          isLoading={isLoading}
        />
      )}

      {/* Success Notification */}
      {successPayment && (
        <PaymentSuccessNotification
          payment={successPayment}
          onClose={() => setSuccessPayment(null)}
        />
      )}
    </Box>
  )
}
