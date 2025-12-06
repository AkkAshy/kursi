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
  Button,
  Input,
  Avatar,
} from '@chakra-ui/react'
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiCheck,
  FiX,
  FiLock,
} from 'react-icons/fi'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { TelegramLinkCard } from '@/components/profile/TelegramLink'

export default function StudentProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { user, fetchUser } = useAuthStore()

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Проверяем авторизацию с задержкой
  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        window.location.href = '/login?redirect=/student/profile'
        return
      }
      setAuthChecked(true)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!authChecked) return

      try {
        setIsLoading(true)

        // Загружаем пользователя в store если ещё не загружен
        if (!user) {
          await fetchUser()
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (authChecked) {
      fetchData()
    }
  }, [authChecked, user, fetchUser])

  // Set edit values when user loads
  useEffect(() => {
    if (user) {
      setEditName(user.full_name || '')
      setEditEmail(user.email || '')
    }
  }, [user])

  const handleSaveName = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await api.updateProfile({ full_name: editName })
      await fetchUser()
      setIsEditingName(false)
    } catch (err) {
      setSaveError('Не удалось сохранить имя')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEmail = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await api.updateProfile({ email: editEmail })
      await fetchUser()
      setIsEditingEmail(false)
    } catch (err) {
      setSaveError('Не удалось сохранить email')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }

    setIsSaving(true)
    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      setPasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
    } catch (err) {
      setPasswordError('Неверный текущий пароль')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка профиля...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box p={8}>
      {/* Page Header */}
      <Box mb={8}>
          <Heading size="lg" color="#3E3E3C" mb={2}>
            Мой профиль
          </Heading>
          <Text color="#6F6F6A">
            Управление данными аккаунта
          </Text>
        </Box>

        {/* Error message */}
        {saveError && (
          <Box
            bg="#FEE2E2"
            color="#DC2626"
            p={4}
            borderRadius="12px"
            mb={6}
          >
            {saveError}
          </Box>
        )}

        {/* Password success message */}
        {passwordSuccess && (
          <Box
            bg="#E8F5EE"
            color="#4C8F6D"
            p={4}
            borderRadius="12px"
            mb={6}
          >
            Пароль успешно изменён!
          </Box>
        )}

        <VStack gap={6} align="stretch" maxW="600px">
          {/* Avatar Card */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <Flex align="center" gap={6}>
                <Avatar.Root size="2xl">
                  <Avatar.Fallback
                    bg="#4C8F6D"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    {getInitials(user?.full_name || user?.username || '')}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Box>
                  <Heading size="md" color="#3E3E3C" mb={1}>
                    {user?.full_name || user?.username || 'Пользователь'}
                  </Heading>
                  <Text fontSize="14px" color="#6F6F6A">
                    @{user?.username}
                  </Text>
                  <HStack gap={2} mt={2}>
                    <Box
                      px={3}
                      py={1}
                      bg="#E8F5EE"
                      color="#4C8F6D"
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="600"
                    >
                      Студент
                    </Box>
                  </HStack>
                </Box>
              </Flex>
            </Card.Body>
          </Card.Root>

          {/* Personal Info Card */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Header p={6} pb={4}>
              <Heading size="sm" color="#3E3E3C">
                Личные данные
              </Heading>
            </Card.Header>
            <Card.Body p={6} pt={0}>
              <VStack gap={4} align="stretch">
                {/* Full Name */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiUser} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A">
                      Полное имя
                    </Text>
                  </HStack>
                  {isEditingName ? (
                    <HStack gap={2}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Введите имя"
                        borderRadius="10px"
                        borderColor="#EFE8E0"
                        _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                        flex={1}
                      />
                      <Button
                        size="sm"
                        bg="#4C8F6D"
                        color="white"
                        borderRadius="8px"
                        onClick={handleSaveName}
                        disabled={isSaving}
                      >
                        <Icon as={FiCheck} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        borderRadius="8px"
                        onClick={() => {
                          setIsEditingName(false)
                          setEditName(user?.full_name || '')
                        }}
                      >
                        <Icon as={FiX} />
                      </Button>
                    </HStack>
                  ) : (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="15px" color="#3E3E3C">
                        {user?.full_name || '—'}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="#6F6F6A"
                        onClick={() => setIsEditingName(true)}
                      >
                        <Icon as={FiEdit2} />
                      </Button>
                    </Flex>
                  )}
                </Box>

                {/* Phone */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiPhone} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A">
                      Телефон
                    </Text>
                  </HStack>
                  <Text fontSize="15px" color="#3E3E3C">
                    {user?.phone || '—'}
                  </Text>
                  <Text fontSize="12px" color="#B5A797" mt={1}>
                    Телефон нельзя изменить
                  </Text>
                </Box>

                {/* Email */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiMail} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A">
                      Email
                    </Text>
                  </HStack>
                  {isEditingEmail ? (
                    <HStack gap={2}>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Введите email"
                        borderRadius="10px"
                        borderColor="#EFE8E0"
                        _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                        flex={1}
                      />
                      <Button
                        size="sm"
                        bg="#4C8F6D"
                        color="white"
                        borderRadius="8px"
                        onClick={handleSaveEmail}
                        disabled={isSaving}
                      >
                        <Icon as={FiCheck} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        borderRadius="8px"
                        onClick={() => {
                          setIsEditingEmail(false)
                          setEditEmail(user?.email || '')
                        }}
                      >
                        <Icon as={FiX} />
                      </Button>
                    </HStack>
                  ) : (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="15px" color="#3E3E3C">
                        {user?.email || '—'}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="#6F6F6A"
                        onClick={() => setIsEditingEmail(true)}
                      >
                        <Icon as={FiEdit2} />
                      </Button>
                    </Flex>
                  )}
                </Box>

                {/* Registration Date */}
                <Box>
                  <HStack gap={2} mb={2}>
                    <Icon as={FiCalendar} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A">
                      Дата регистрации
                    </Text>
                  </HStack>
                  <Text fontSize="15px" color="#3E3E3C">
                    {user?.created_at ? formatDate(user.created_at) : '—'}
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Security Card */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Header p={6} pb={4}>
              <Heading size="sm" color="#3E3E3C">
                Безопасность
              </Heading>
            </Card.Header>
            <Card.Body p={6} pt={0}>
              {isChangingPassword ? (
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                      Текущий пароль
                    </Text>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Введите текущий пароль"
                      borderRadius="10px"
                      borderColor="#EFE8E0"
                      _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                      Новый пароль
                    </Text>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      borderRadius="10px"
                      borderColor="#EFE8E0"
                      _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#6F6F6A" mb={2}>
                      Подтвердите новый пароль
                    </Text>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      borderRadius="10px"
                      borderColor="#EFE8E0"
                      _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                    />
                  </Box>

                  {passwordError && (
                    <Text fontSize="13px" color="#DC2626">
                      {passwordError}
                    </Text>
                  )}

                  <HStack gap={3}>
                    <Button
                      bg="#4C8F6D"
                      color="white"
                      borderRadius="10px"
                      onClick={handleChangePassword}
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner size="sm" /> : 'Сохранить'}
                    </Button>
                    <Button
                      variant="ghost"
                      color="#6F6F6A"
                      borderRadius="10px"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setOldPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setPasswordError(null)
                      }}
                    >
                      Отмена
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Flex justify="space-between" align="center">
                  <HStack gap={3}>
                    <Icon as={FiLock} boxSize={5} color="#6F6F6A" />
                    <Box>
                      <Text fontSize="15px" color="#3E3E3C">
                        Пароль
                      </Text>
                      <Text fontSize="13px" color="#6F6F6A">
                        ••••••••
                      </Text>
                    </Box>
                  </HStack>
                  <Button
                    variant="outline"
                    color="#4C8F6D"
                    borderColor="#4C8F6D"
                    borderRadius="10px"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                    _hover={{ bg: '#E8F5EE' }}
                  >
                    Изменить
                  </Button>
                </Flex>
              )}
            </Card.Body>
          </Card.Root>

          {/* Telegram Link Card */}
          <TelegramLinkCard />
        </VStack>
    </Box>
  )
}
