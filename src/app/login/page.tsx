'use client'

import { useState } from 'react'
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
} from '@chakra-ui/react'
import { FiPhone, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import NextLink from 'next/link'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(loginValue, password)
      // Получаем обновлённого пользователя из store
      const { user } = useAuthStore.getState()

      // Редирект в зависимости от роли
      if (user?.role === 'admin' || user?.role === 'manager') {
        router.push('/admin')
      } else if (user?.role === 'student') {
        router.push('/student')
      } else {
        router.push('/teacher')
      }
    } catch {
      // Error is handled in store
    }
  }

  return (
    <Flex minH="100vh" bg="#FAF7F2">
      {/* Left side - Form */}
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
                mb={12}
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
                <VStack gap={6} align="stretch">
                  <Box textAlign="center" mb={2}>
                    <Heading
                      as="h1"
                      fontSize="28px"
                      fontWeight="bold"
                      color="#3E3E3C"
                      letterSpacing="-0.5px"
                      mb={2}
                    >
                      Добро пожаловать
                    </Heading>
                    <Text color="#6F6F6A" fontSize="15px">
                      Войдите в свой аккаунт
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

                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                      Телефон или имя пользователя
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
                        type="text"
                        placeholder="+998 90 123 45 67"
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
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
                        placeholder="Введите пароль"
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

                  <Flex justify="end">
                    <ChakraLink asChild>
                      <NextLink href="/forgot-password">
                        <Text
                          fontSize="13px"
                          color="#4C8F6D"
                          fontWeight="500"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Забыли пароль?
                        </Text>
                      </NextLink>
                    </ChakraLink>
                  </Flex>

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
                    disabled={isLoading || !loginValue || !password}
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
                    {isLoading ? 'Входим...' : 'Войти'}
                    {!isLoading && <Icon as={FiArrowRight} ml={2} />}
                  </Button>

                  <HStack justify="center" gap={1}>
                    <Text fontSize="14px" color="#6F6F6A">
                      Нет аккаунта?
                    </Text>
                    <ChakraLink asChild>
                      <NextLink href="/register">
                        <Text
                          fontSize="14px"
                          color="#4C8F6D"
                          fontWeight="600"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Зарегистрироваться
                        </Text>
                      </NextLink>
                    </ChakraLink>
                  </HStack>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>

      {/* Right side - Decorative */}
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
          right="-100px"
        />
        <Box
          position="absolute"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(76, 143, 109, 0.08)"
          bottom="-50px"
          left="-50px"
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
            <Text fontSize="4xl">📚</Text>
          </Box>
          <Heading
            as="h2"
            fontSize="28px"
            fontWeight="bold"
            color="#3E3E3C"
            letterSpacing="-0.5px"
          >
            Создавайте курсы легко
          </Heading>
          <Text color="#6F6F6A" fontSize="16px" lineHeight="1.6">
            Загружайте видео, добавляйте материалы и привлекайте студентов через Telegram-бота
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}
