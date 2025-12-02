'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Card,
  Icon,
  Flex,
  Link as ChakraLink,
  Spinner,
} from '@chakra-ui/react'
import { FiPhone, FiLock, FiUser, FiArrowRight, FiBookOpen, FiUsers, FiAlertCircle, FiMail } from 'react-icons/fi'
import NextLink from 'next/link'
import { useAuthStore } from '@/stores/authStore'

type Role = 'creator' | 'student'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [selectedRole, setSelectedRole] = useState<Role>('student')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameShake, setUsernameShake] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('+998')
  const [email, setEmail] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Убираем все нецифровые символы, кроме +
    const rawDigits = value.replace(/[^\d+]/g, '')

    // Извлекаем только цифры
    const digits = rawDigits.replace(/\D/g, '')

    // Убедимся, что номер начинается с 998
    let cleanDigits = digits
    if (!digits.startsWith('998')) {
      cleanDigits = '998' + digits.replace(/^998/, '')
    }

    // Ограничиваем длину: 998 + 9 цифр = 12 цифр
    cleanDigits = cleanDigits.slice(0, 12)

    // Форматируем: +998 XX XXX XX XX
    let formatted = '+998'
    if (cleanDigits.length > 3) {
      formatted += ' ' + cleanDigits.slice(3, 5) // XX
    }
    if (cleanDigits.length > 5) {
      formatted += ' ' + cleanDigits.slice(5, 8) // XXX
    }
    if (cleanDigits.length > 8) {
      formatted += ' ' + cleanDigits.slice(8, 10) // XX
    }
    if (cleanDigits.length > 10) {
      formatted += ' ' + cleanDigits.slice(10, 12) // XX
    }

    setPhone(formatted)
  }
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Проверяем на русские символы
    const hasRussian = /[а-яА-ЯёЁ]/.test(value)

    if (hasRussian) {
      setUsernameError('Username должен быть только на английском')
      setUsernameShake(true)
      setTimeout(() => setUsernameShake(false), 500)
      // Убираем русские символы
      const cleanValue = value.replace(/[а-яА-ЯёЁ]/g, '')
      setUsername(cleanValue)
    } else {
      setUsernameError('')
      // Разрешаем только латиницу, цифры и подчёркивание
      const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '')
      setUsername(cleanValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (password !== passwordConfirm) {
      return
    }

    try {
      // Убираем пробелы из номера телефона для отправки на сервер
      const cleanPhone = phone.replace(/\s/g, '')
      await register({
        phone: cleanPhone,
        username,
        full_name: fullName,
        email: selectedRole === 'creator' ? email : undefined,
        password,
        password_confirm: passwordConfirm,
        role: selectedRole,
      })
      router.push(selectedRole === 'creator' ? '/teacher' : '/student')
    } catch {
      // Error is handled in store
    }
  }

  const isFormValid = username && fullName && phone && password && passwordConfirm && password === passwordConfirm &&
    (selectedRole === 'student' || (selectedRole === 'creator' && email))

  // Предотвращаем ошибку гидратации
  if (!mounted) {
    return (
      <Flex minH="100vh" bg="#FAF7F2" align="center" justify="center">
        <Spinner size="xl" color="#4C8F6D" />
      </Flex>
    )
  }

  return (
    <Flex minH="100vh" bg="#FAF7F2">
      {/* Left side - Decorative */}
      <Box
        flex={1}
        bg="linear-gradient(135deg, #E8F5EE 0%, #DDE8DD 100%)"
        display={{ base: 'none', lg: 'flex' }}
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box
          position="absolute"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="rgba(76, 143, 109, 0.1)"
          top="-100px"
          left="-100px"
        />
        <Box
          position="absolute"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(76, 143, 109, 0.08)"
          bottom="-50px"
          right="-50px"
        />

        <VStack gap={6} textAlign="center" maxW="400px" p={8}>
          <Box
            w={24}
            h={24}
            bg="white"
            borderRadius="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 32px -4px rgba(76, 143, 109, 0.2)"
          >
            <Text fontSize="4xl">🚀</Text>
          </Box>
          <Heading
            as="h2"
            fontSize="28px"
            fontWeight="bold"
            color="#3E3E3C"
            letterSpacing="-0.5px"
          >
            Начните обучение сегодня
          </Heading>
          <Text color="#6F6F6A" fontSize="16px" lineHeight="1.6">
            Присоединяйтесь к тысячам студентов и преподавателей на нашей платформе
          </Text>
        </VStack>
      </Box>

      {/* Right side - Form */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        p={8}
      >
        <Box w="full" maxW="420px">
          {/* Logo */}
          <ChakraLink asChild>
            <NextLink href="/">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="#4C8F6D"
                mb={8}
                letterSpacing="-0.5px"
              >
                Kursi
              </Text>
            </NextLink>
          </ChakraLink>

          {/* Form Card */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 4px 24px -4px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <form onSubmit={handleSubmit}>
                <VStack gap={5} align="stretch">
                  <Box textAlign="center" mb={2}>
                    <Heading
                      as="h1"
                      fontSize="28px"
                      fontWeight="bold"
                      color="#3E3E3C"
                      letterSpacing="-0.5px"
                      mb={2}
                    >
                      Регистрация
                    </Heading>
                    <Text color="#6F6F6A" fontSize="15px">
                      Создайте аккаунт для начала работы
                    </Text>
                  </Box>

                  {error && (
                    <Flex
                      bg="#FDF6ED"
                      borderRadius="12px"
                      p={4}
                      align="center"
                      gap={3}
                    >
                      <Icon as={FiAlertCircle} color="#C98A4A" boxSize={5} />
                      <Text fontSize="14px" color="#C98A4A">
                        {error}
                      </Text>
                    </Flex>
                  )}

                  {/* Role Selection */}
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={3}>
                      Выберите роль
                    </Text>
                    <HStack gap={3}>
                      <Box
                        flex={1}
                        p={4}
                        borderRadius="14px"
                        border="2px solid"
                        borderColor={selectedRole === 'student' ? '#4C8F6D' : '#EFE8E0'}
                        bg={selectedRole === 'student' ? '#E8F5EE' : '#FDFBF8'}
                        cursor="pointer"
                        transition="all 0.2s"
                        onClick={() => setSelectedRole('student')}
                        _hover={{
                          borderColor: selectedRole === 'student' ? '#4C8F6D' : '#C9BDB0',
                        }}
                      >
                        <VStack gap={2}>
                          <Icon
                            as={FiUsers}
                            boxSize={6}
                            color={selectedRole === 'student' ? '#4C8F6D' : '#6F6F6A'}
                          />
                          <Text
                            fontSize="14px"
                            fontWeight="600"
                            color={selectedRole === 'student' ? '#4C8F6D' : '#3E3E3C'}
                          >
                            Студент
                          </Text>
                          <Text
                            fontSize="11px"
                            color="#6F6F6A"
                            textAlign="center"
                          >
                            Изучайте курсы
                          </Text>
                        </VStack>
                      </Box>

                      <Box
                        flex={1}
                        p={4}
                        borderRadius="14px"
                        border="2px solid"
                        borderColor={selectedRole === 'creator' ? '#4C8F6D' : '#EFE8E0'}
                        bg={selectedRole === 'creator' ? '#E8F5EE' : '#FDFBF8'}
                        cursor="pointer"
                        transition="all 0.2s"
                        onClick={() => setSelectedRole('creator')}
                        _hover={{
                          borderColor: selectedRole === 'creator' ? '#4C8F6D' : '#C9BDB0',
                        }}
                      >
                        <VStack gap={2}>
                          <Icon
                            as={FiBookOpen}
                            boxSize={6}
                            color={selectedRole === 'creator' ? '#4C8F6D' : '#6F6F6A'}
                          />
                          <Text
                            fontSize="14px"
                            fontWeight="600"
                            color={selectedRole === 'creator' ? '#4C8F6D' : '#3E3E3C'}
                          >
                            Преподаватель
                          </Text>
                          <Text
                            fontSize="11px"
                            color="#6F6F6A"
                            textAlign="center"
                          >
                            Создавайте курсы
                          </Text>
                        </VStack>
                      </Box>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Username (логин)
                    </Text>
                    <Box
                      position="relative"
                      animation={usernameShake ? 'shake 0.5s ease-in-out' : undefined}
                      css={{
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
                          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
                        },
                      }}
                    >
                      <Icon
                        as={FiUser}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        color={usernameError ? '#C98A4A' : '#6F6F6A'}
                        boxSize={4}
                      />
                      <Input
                        type="text"
                        placeholder="ivan_petrov"
                        value={username}
                        onChange={handleUsernameChange}
                        pl={11}
                        bg="#FDFBF8"
                        border="1px solid"
                        borderColor={usernameError ? '#C98A4A' : '#EFE8E0'}
                        borderRadius="12px"
                        fontSize="15px"
                        py={6}
                        _focus={{
                          borderColor: usernameError ? '#C98A4A' : '#4C8F6D',
                          boxShadow: usernameError ? '0 0 0 1px #C98A4A' : '0 0 0 1px #4C8F6D',
                        }}
                        _placeholder={{ color: '#B5A797' }}
                      />
                    </Box>
                    {usernameError && (
                      <Text fontSize="12px" color="#C98A4A" mt={1}>
                        {usernameError}
                      </Text>
                    )}
                    <Text fontSize="11px" color="#B5A797" mt={1}>
                      Только латинские буквы, цифры и _
                    </Text>
                  </Box>

                  {/* ФИО поле */}
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Полное ФИО
                    </Text>
                    <Box position="relative">
                      <Icon
                        as={FiUser}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        color="#6F6F6A"
                        boxSize={4}
                      />
                      <Input
                        type="text"
                        placeholder="Иванов Иван Иванович"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        pl={11}
                        bg="#FDFBF8"
                        border="1px solid"
                        borderColor="#EFE8E0"
                        borderRadius="12px"
                        fontSize="15px"
                        py={6}
                        _focus={{
                          borderColor: '#4C8F6D',
                          boxShadow: '0 0 0 1px #4C8F6D',
                        }}
                        _placeholder={{ color: '#B5A797' }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Номер телефона
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
                        value={phone}
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

                  {/* Email поле - только для преподавателей */}
                  {selectedRole === 'creator' && (
                    <Box>
                      <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                        Email
                      </Text>
                      <Box position="relative">
                        <Icon
                          as={FiMail}
                          position="absolute"
                          left={4}
                          top="50%"
                          transform="translateY(-50%)"
                          color="#6F6F6A"
                          boxSize={4}
                        />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          pl={11}
                          bg="#FDFBF8"
                          border="1px solid"
                          borderColor="#EFE8E0"
                          borderRadius="12px"
                          fontSize="15px"
                          py={6}
                          _focus={{
                            borderColor: '#4C8F6D',
                            boxShadow: '0 0 0 1px #4C8F6D',
                          }}
                          _placeholder={{ color: '#B5A797' }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Пароль
                    </Text>
                    <Box position="relative">
                      <Icon
                        as={FiLock}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        color="#6F6F6A"
                        boxSize={4}
                      />
                      <Input
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        pl={11}
                        bg="#FDFBF8"
                        border="1px solid"
                        borderColor="#EFE8E0"
                        borderRadius="12px"
                        fontSize="15px"
                        py={6}
                        _focus={{
                          borderColor: '#4C8F6D',
                          boxShadow: '0 0 0 1px #4C8F6D',
                        }}
                        _placeholder={{ color: '#B5A797' }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Подтверждение пароля
                    </Text>
                    <Box position="relative">
                      <Icon
                        as={FiLock}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        color="#6F6F6A"
                        boxSize={4}
                      />
                      <Input
                        type="password"
                        placeholder="Повторите пароль"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        pl={11}
                        bg="#FDFBF8"
                        border="1px solid"
                        borderColor={passwordConfirm && password !== passwordConfirm ? '#C98A4A' : '#EFE8E0'}
                        borderRadius="12px"
                        fontSize="15px"
                        py={6}
                        _focus={{
                          borderColor: '#4C8F6D',
                          boxShadow: '0 0 0 1px #4C8F6D',
                        }}
                        _placeholder={{ color: '#B5A797' }}
                      />
                    </Box>
                    {passwordConfirm && password !== passwordConfirm && (
                      <Text fontSize="12px" color="#C98A4A" mt={1}>
                        Пароли не совпадают
                      </Text>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    bg="#4C8F6D"
                    color="white"
                    borderRadius="12px"
                    py={6}
                    fontSize="15px"
                    fontWeight="600"
                    boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
                    transition="all 0.2s ease-out"
                    loading={isLoading}
                    disabled={isLoading || !isFormValid}
                    _hover={{
                      bg: '#3F7A5C',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px -2px rgba(76, 143, 109, 0.4)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    _disabled={{
                      opacity: 0.7,
                      cursor: 'not-allowed',
                      transform: 'none',
                    }}
                  >
                    {isLoading ? 'Создаём...' : 'Создать аккаунт'}
                    {!isLoading && <Icon as={FiArrowRight} ml={2} />}
                  </Button>

                  <HStack justify="center" gap={1}>
                    <Text fontSize="14px" color="#6F6F6A">
                      Уже есть аккаунт?
                    </Text>
                    <ChakraLink asChild>
                      <NextLink href="/login">
                        <Text
                          fontSize="14px"
                          color="#4C8F6D"
                          fontWeight="600"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Войти
                        </Text>
                      </NextLink>
                    </ChakraLink>
                  </HStack>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>

          {/* Terms */}
          <Text fontSize="12px" color="#6F6F6A" textAlign="center" mt={4} lineHeight="1.6">
            Регистрируясь, вы соглашаетесь с{' '}
            <Text as="span" color="#4C8F6D" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              условиями использования
            </Text>
            {' '}и{' '}
            <Text as="span" color="#4C8F6D" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              политикой конфиденциальности
            </Text>
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
