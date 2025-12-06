'use client'

import { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  Card,
  Icon,
  HStack,
  PinInput,
} from '@chakra-ui/react'
import { FiPhone, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

type Step = 'phone' | 'code' | 'password' | 'success'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)

  const handleRequestCode = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await api.requestPasswordReset(phone)
      // В dev режиме показываем код
      if (response.dev_code) {
        setDevCode(response.dev_code)
      }
      setStep('code')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await api.verifyResetCode(phone, code)
      setResetToken(response.reset_token)
      setStep('password')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Неверный код')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError(null)

    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setIsLoading(true)

    try {
      await api.resetPassword(resetToken, newPassword)
      setStep('success')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bg="#FDFBF8"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card.Root
        maxW="400px"
        w="full"
        bg="white"
        borderRadius="24px"
        boxShadow="0 4px 24px -8px rgba(0,0,0,0.1)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Body p={8}>
          <VStack gap={6} align="stretch">
            {/* Back link */}
            <NextLink href="/login">
              <HStack color="#6F6F6A" fontSize="14px" _hover={{ color: '#4C8F6D' }}>
                <Icon as={FiArrowLeft} />
                <Text>Назад к входу</Text>
              </HStack>
            </NextLink>

            {/* Step: Phone */}
            {step === 'phone' && (
              <>
                <Box textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="#E8F5EE"
                    borderRadius="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Icon as={FiPhone} boxSize={8} color="#4C8F6D" />
                  </Box>
                  <Heading size="lg" color="#3E3E3C" mb={2}>
                    Восстановление пароля
                  </Heading>
                  <Text color="#6F6F6A" fontSize="15px">
                    Введите номер телефона, привязанный к аккаунту
                  </Text>
                </Box>

                {error && (
                  <Box bg="#FEE2E2" color="#DC2626" p={3} borderRadius="12px" fontSize="14px">
                    {error}
                  </Box>
                )}

                <Box>
                  <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                    Номер телефона
                  </Text>
                  <Input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    borderRadius="12px"
                    borderColor="#EFE8E0"
                    py={6}
                    _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                  />
                </Box>

                <Button
                  w="full"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  py={6}
                  onClick={handleRequestCode}
                  disabled={!phone || isLoading}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  {isLoading ? 'Отправка...' : 'Получить код'}
                </Button>
              </>
            )}

            {/* Step: Code */}
            {step === 'code' && (
              <>
                <Box textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="#E8F5EE"
                    borderRadius="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Icon as={FiLock} boxSize={8} color="#4C8F6D" />
                  </Box>
                  <Heading size="lg" color="#3E3E3C" mb={2}>
                    Введите код
                  </Heading>
                  <Text color="#6F6F6A" fontSize="15px">
                    Код отправлен на номер ***{phone.slice(-4)}
                  </Text>
                </Box>

                {/* Dev code hint */}
                {devCode && (
                  <Box bg="#FEF3C7" color="#D97706" p={3} borderRadius="12px" fontSize="14px" textAlign="center">
                    [DEV] Код: <strong>{devCode}</strong>
                  </Box>
                )}

                {error && (
                  <Box bg="#FEE2E2" color="#DC2626" p={3} borderRadius="12px" fontSize="14px">
                    {error}
                  </Box>
                )}

                <Box>
                  <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={3} textAlign="center">
                    6-значный код
                  </Text>
                  <HStack justify="center">
                    <PinInput.Root
                      value={code.split('')}
                      onValueChange={(e) => setCode(e.value.join(''))}
                      otp
                    >
                      <PinInput.Control>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <PinInput.Input
                            key={i}
                            index={i}
                            style={{
                              width: '48px',
                              height: '56px',
                              fontSize: '24px',
                              fontWeight: '600',
                              textAlign: 'center',
                              borderRadius: '12px',
                              border: '2px solid #EFE8E0',
                            }}
                          />
                        ))}
                      </PinInput.Control>
                    </PinInput.Root>
                  </HStack>
                </Box>

                <Button
                  w="full"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  py={6}
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || isLoading}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  {isLoading ? 'Проверка...' : 'Подтвердить'}
                </Button>

                <Button
                  variant="ghost"
                  color="#6F6F6A"
                  onClick={() => {
                    setStep('phone')
                    setCode('')
                    setError(null)
                  }}
                >
                  Изменить номер
                </Button>
              </>
            )}

            {/* Step: Password */}
            {step === 'password' && (
              <>
                <Box textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="#E8F5EE"
                    borderRadius="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Icon as={FiLock} boxSize={8} color="#4C8F6D" />
                  </Box>
                  <Heading size="lg" color="#3E3E3C" mb={2}>
                    Новый пароль
                  </Heading>
                  <Text color="#6F6F6A" fontSize="15px">
                    Придумайте надёжный пароль
                  </Text>
                </Box>

                {error && (
                  <Box bg="#FEE2E2" color="#DC2626" p={3} borderRadius="12px" fontSize="14px">
                    {error}
                  </Box>
                )}

                <VStack gap={4}>
                  <Box w="full">
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                      Новый пароль
                    </Text>
                    <Input
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      borderRadius="12px"
                      borderColor="#EFE8E0"
                      py={6}
                      _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                    />
                  </Box>

                  <Box w="full">
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                      Подтвердите пароль
                    </Text>
                    <Input
                      type="password"
                      placeholder="Повторите пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      borderRadius="12px"
                      borderColor="#EFE8E0"
                      py={6}
                      _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                    />
                  </Box>
                </VStack>

                <Button
                  w="full"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  py={6}
                  onClick={handleResetPassword}
                  disabled={!newPassword || !confirmPassword || isLoading}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
                </Button>
              </>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <>
                <Box textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="#E8F5EE"
                    borderRadius="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Icon as={FiCheck} boxSize={8} color="#4C8F6D" />
                  </Box>
                  <Heading size="lg" color="#3E3E3C" mb={2}>
                    Пароль изменён!
                  </Heading>
                  <Text color="#6F6F6A" fontSize="15px">
                    Теперь вы можете войти с новым паролем
                  </Text>
                </Box>

                <Button
                  w="full"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  py={6}
                  onClick={() => router.push('/login')}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  Войти
                </Button>
              </>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
