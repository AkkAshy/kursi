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
  Spinner,
  Input,
  Textarea,
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiCreditCard,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiPhone,
  FiCopy,
} from 'react-icons/fi'
import { use } from 'react'
import api from '@/lib/api'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

interface PaymentInfo {
  course: { id: number; title: string; price: string }
  payment_info: {
    card_number: string
    card_number_formatted: string
    card_holder_name: string
    payment_phone: string
    instructions: string
  }
}

export default function BuyCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)
  const router = useRouter()

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [studentPhone, setStudentPhone] = useState('+998')
  const [comment, setComment] = useState('')
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Проверяем авторизацию с небольшой задержкой чтобы токен успел загрузиться
  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        router.push(`/login?redirect=/courses/${courseId}/buy`)
        return false
      }
      setAuthChecked(true)
      return true
    }

    // Даём время на загрузку токена из localStorage
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [courseId, router])

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!authChecked) return

      try {
        setIsLoading(true)
        const data = await api.getCoursePaymentInfo(courseId)
        setPaymentInfo(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить информацию об оплате'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isNaN(courseId) && authChecked) {
      fetchPaymentInfo()
    }
  }, [courseId, authChecked])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    const rawDigits = value.replace(/[^\d+]/g, '')
    const digits = rawDigits.replace(/\D/g, '')

    let cleanDigits = digits
    if (!digits.startsWith('998')) {
      cleanDigits = '998' + digits.replace(/^998/, '')
    }
    cleanDigits = cleanDigits.slice(0, 12)

    let formatted = '+998'
    if (cleanDigits.length > 3) {
      formatted += ' ' + cleanDigits.slice(3, 5)
    }
    if (cleanDigits.length > 5) {
      formatted += ' ' + cleanDigits.slice(5, 8)
    }
    if (cleanDigits.length > 8) {
      formatted += ' ' + cleanDigits.slice(8, 10)
    }
    if (cleanDigits.length > 10) {
      formatted += ' ' + cleanDigits.slice(10, 12)
    }

    setStudentPhone(formatted)
  }

  const handleCopyCard = async () => {
    if (paymentInfo) {
      await navigator.clipboard.writeText(paymentInfo.payment_info.card_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
    }
  }

  const handleSubmit = async () => {
    if (!screenshot || !studentPhone || studentPhone.length < 17) {
      return
    }

    try {
      setIsSubmitting(true)
      const cleanPhone = studentPhone.replace(/\s/g, '')
      await api.submitCoursePayment(courseId, screenshot, cleanPhone, comment || undefined)
      setIsSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось отправить платёж'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(parseFloat(price)) + ' сум'
  }

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error && !isSuccess) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2" direction="column" gap={4}>
        <Icon as={FiAlertCircle} boxSize={16} color="#C98A4A" />
        <Heading size="lg" color="#3E3E3C">Ошибка</Heading>
        <Text color="#6F6F6A">{error}</Text>
        <NextLink href={`/courses/${courseId}`}>
          <Button
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            _hover={{ bg: '#3F7A5C' }}
          >
            Вернуться к курсу
          </Button>
        </NextLink>
      </Flex>
    )
  }

  if (isSuccess) {
    return (
      <Box minH="100vh" bg="#FAF7F2">
        <Box maxW="600px" mx="auto" px={6} py={16}>
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 4px 24px -4px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={10}>
              <VStack gap={6}>
                <Flex
                  w={20}
                  h={20}
                  bg="#E8F5EE"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiCheck} boxSize={10} color="#4C8F6D" />
                </Flex>
                <Heading size="lg" color="#3E3E3C" textAlign="center">
                  Платёж отправлен!
                </Heading>
                <Text color="#6F6F6A" textAlign="center" lineHeight="1.6">
                  Ваш платёж отправлен на проверку. После подтверждения вы получите
                  доступ к курсу. Обычно это занимает несколько часов.
                </Text>
                <HStack gap={4} pt={4}>
                  <NextLink href="/student/purchases">
                    <Button
                      variant="outline"
                      borderColor="#4C8F6D"
                      color="#4C8F6D"
                      borderRadius="12px"
                      _hover={{ bg: '#E8F5EE' }}
                    >
                      Мои покупки
                    </Button>
                  </NextLink>
                  <NextLink href="/student">
                    <Button
                      bg="#4C8F6D"
                      color="white"
                      borderRadius="12px"
                      _hover={{ bg: '#3F7A5C' }}
                    >
                      К моим курсам
                    </Button>
                  </NextLink>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      </Box>
    )
  }

  if (!paymentInfo) {
    return null
  }

  return (
    <Box minH="100vh" bg="#FAF7F2">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="#EFE8E0" py={4}>
        <Box maxW="800px" mx="auto" px={6}>
          <HStack gap={4}>
            <NextLink href={`/courses/${courseId}`}>
              <Flex
                w={10}
                h={10}
                bg="#FDFBF8"
                borderRadius="12px"
                align="center"
                justify="center"
                cursor="pointer"
                border="1px solid"
                borderColor="#EFE8E0"
                transition="all 0.15s"
                _hover={{ borderColor: '#4C8F6D', color: '#4C8F6D' }}
              >
                <Icon as={FiArrowLeft} boxSize={5} />
              </Flex>
            </NextLink>
            <Box>
              <Heading size="md" color="#3E3E3C">
                Оплата курса
              </Heading>
              <Text fontSize="13px" color="#6F6F6A">
                {paymentInfo.course.title}
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="800px" mx="auto" px={6} py={8}>
        <VStack gap={6} align="stretch">
          {/* Price Card */}
          <Card.Root
            bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
            borderRadius="20px"
            boxShadow="0 8px 32px -8px rgba(76, 143, 109, 0.4)"
          >
            <Card.Body p={8}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="14px" color="whiteAlpha.800" mb={1}>
                    К оплате
                  </Text>
                  <Heading size="xl" color="white">
                    {formatPrice(paymentInfo.course.price)}
                  </Heading>
                </Box>
                <Icon as={FiCreditCard} boxSize={12} color="whiteAlpha.600" />
              </Flex>
            </Card.Body>
          </Card.Root>

          {/* Payment Details */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Heading size="sm" color="#3E3E3C">
                  Реквизиты для оплаты
                </Heading>

                {/* Card Number */}
                <Box>
                  <Text fontSize="13px" color="#6F6F6A" mb={2}>
                    Номер карты
                  </Text>
                  <Flex
                    p={4}
                    bg="#FDFBF8"
                    borderRadius="12px"
                    align="center"
                    justify="space-between"
                  >
                    <Text fontSize="18px" fontWeight="600" color="#3E3E3C" fontFamily="monospace">
                      {paymentInfo.payment_info.card_number_formatted}
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      color={copied ? '#4C8F6D' : '#6F6F6A'}
                      onClick={handleCopyCard}
                      _hover={{ color: '#4C8F6D' }}
                    >
                      <Icon as={copied ? FiCheck : FiCopy} mr={2} />
                      {copied ? 'Скопировано' : 'Копировать'}
                    </Button>
                  </Flex>
                </Box>

                {/* Card Holder */}
                {paymentInfo.payment_info.card_holder_name && (
                  <Box>
                    <Text fontSize="13px" color="#6F6F6A" mb={2}>
                      Получатель
                    </Text>
                    <Text fontSize="16px" color="#3E3E3C">
                      {paymentInfo.payment_info.card_holder_name}
                    </Text>
                  </Box>
                )}

                {/* Instructions */}
                {paymentInfo.payment_info.instructions && (
                  <Box
                    p={4}
                    bg="#FDF6ED"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="#F5E6D3"
                  >
                    <Text fontSize="14px" color="#C98A4A" fontWeight="600" mb={2}>
                      Инструкция
                    </Text>
                    <Text fontSize="14px" color="#6F6F6A" whiteSpace="pre-wrap">
                      {paymentInfo.payment_info.instructions}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Upload Form */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Heading size="sm" color="#3E3E3C">
                  Подтверждение оплаты
                </Heading>

                {/* Phone */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Ваш номер телефона
                  </Text>
                  <Box position="relative">
                    <Icon
                      as={FiPhone}
                      position="absolute"
                      left={4}
                      top="50%"
                      transform="translateY(-50%)"
                      color="#6F6F6A"
                      boxSize={4}
                    />
                    <Input
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={studentPhone}
                      onChange={handlePhoneChange}
                      pl={11}
                      bg="#FDFBF8"
                      border="1px solid"
                      borderColor="#EFE8E0"
                      borderRadius="12px"
                      fontSize="15px"
                      maxLength={17}
                      py={6}
                      _focus={{
                        borderColor: '#4C8F6D',
                        boxShadow: '0 0 0 1px #4C8F6D',
                      }}
                      _placeholder={{ color: '#B5A797' }}
                    />
                  </Box>
                </Box>

                {/* Screenshot */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Скриншот оплаты
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <Flex
                    p={6}
                    bg="#FDFBF8"
                    borderRadius="12px"
                    border="2px dashed"
                    borderColor={screenshot ? '#4C8F6D' : '#EFE8E0'}
                    align="center"
                    justify="center"
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    transition="all 0.15s"
                    _hover={{ borderColor: '#4C8F6D' }}
                  >
                    {screenshot ? (
                      <HStack gap={3}>
                        <Icon as={FiCheck} boxSize={5} color="#4C8F6D" />
                        <Text fontSize="14px" color="#4C8F6D" fontWeight="500">
                          {screenshot.name}
                        </Text>
                      </HStack>
                    ) : (
                      <VStack gap={2}>
                        <Icon as={FiUpload} boxSize={8} color="#6F6F6A" />
                        <Text fontSize="14px" color="#6F6F6A">
                          Нажмите чтобы загрузить скриншот
                        </Text>
                      </VStack>
                    )}
                  </Flex>
                </Box>

                {/* Comment */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Комментарий (необязательно)
                  </Text>
                  <Textarea
                    placeholder="Например: перевод с карты Humo"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    bg="#FDFBF8"
                    border="1px solid"
                    borderColor="#EFE8E0"
                    borderRadius="12px"
                    fontSize="15px"
                    rows={3}
                    _focus={{
                      borderColor: '#4C8F6D',
                      boxShadow: '0 0 0 1px #4C8F6D',
                    }}
                    _placeholder={{ color: '#B5A797' }}
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  py={6}
                  fontSize="15px"
                  fontWeight="600"
                  boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
                  transition="all 0.2s ease-out"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting || !screenshot || studentPhone.length < 17}
                  _hover={{
                    bg: '#3F7A5C',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px -2px rgba(76, 143, 109, 0.4)',
                  }}
                  _disabled={{
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    transform: 'none',
                  }}
                >
                  {isSubmitting ? 'Отправляем...' : 'Отправить на проверку'}
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  )
}
