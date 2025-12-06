'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Input,
  Textarea,
  Badge,
  Spinner,
} from '@chakra-ui/react'
import {
  FiGlobe,
  FiCheck,
  FiX,
  FiExternalLink,
  FiHome,
  FiEdit2,
  FiSave,
} from 'react-icons/fi'
import api from '@/lib/api'

interface TenantData {
  id: number
  subdomain: string
  name: string
  description?: string
  logo_url?: string
  primary_color: string
  status: string
  created_at: string
}

export default function SchoolSettingsPage() {
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields for creating
  const [subdomain, setSubdomain] = useState('')
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Form fields for editing
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    fetchTenant()
  }, [])

  const fetchTenant = async () => {
    try {
      setIsLoading(true)
      const data = await api.getMyTenant()
      setTenant(data)
      if (data) {
        setEditName(data.name)
        setEditDescription(data.description || '')
      }
    } catch {
      setTenant(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced subdomain check
  const checkSubdomain = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSubdomainAvailable(null)
      return
    }

    // Validate format
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(value)) {
      setSubdomainAvailable(false)
      return
    }

    setCheckingSubdomain(true)
    try {
      const result = await api.checkSubdomainAvailability(value)
      setSubdomainAvailable(result.available)
    } catch {
      setSubdomainAvailable(null)
    } finally {
      setCheckingSubdomain(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (subdomain) {
        checkSubdomain(subdomain.toLowerCase())
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [subdomain, checkSubdomain])

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(value)
    setSubdomainAvailable(null)
  }

  const handleCreateSchool = async () => {
    if (!subdomain || !name || !subdomainAvailable) return

    setIsCreating(true)
    setError(null)

    try {
      const newTenant = await api.createTenant({
        subdomain: subdomain.toLowerCase(),
        name,
        description: description || undefined,
      })
      setTenant(newTenant)
      setEditName(newTenant.name)
      setEditDescription(newTenant.description || '')
      // Reload user to get updated role
      window.location.reload()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании школы'
      setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!editName.trim()) return

    setIsSaving(true)
    setError(null)

    try {
      const updated = await api.updateTenant({
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      })
      setTenant(prev => prev ? { ...prev, ...updated } : null)
      setIsEditing(false)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при сохранении'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Flex minH="400px" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка...</Text>
        </VStack>
      </Flex>
    )
  }

  // No tenant - show creation form
  if (!tenant) {
    return (
      <Box maxW="600px">
        <Box mb={8}>
          <Heading
            as="h1"
            fontSize="24px"
            fontWeight="bold"
            color="#3E3E3C"
            letterSpacing="-0.3px"
            mb={2}
          >
            Создайте свою школу
          </Heading>
          <Text fontSize="14px" color="#6F6F6A">
            Выберите уникальный адрес для вашей онлайн-школы
          </Text>
        </Box>

        {error && (
          <Flex bg="#FDF6ED" borderRadius="12px" p={4} align="center" gap={3} mb={6}>
            <Icon as={FiX} color="#C98A4A" boxSize={5} />
            <Text fontSize="14px" color="#C98A4A" flex={1}>
              {error}
            </Text>
          </Flex>
        )}

        <Card.Root
          bg="white"
          borderRadius="20px"
          boxShadow="0 2px 12px -4px rgba(0,0,0,0.08)"
          border="1px solid"
          borderColor="#EFE8E0"
        >
          <Card.Body p={8}>
            <VStack gap={6} align="stretch">
              {/* Subdomain */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#3E3E3C" mb={3}>
                  Адрес вашей школы
                </Text>
                <Flex
                  bg="#FDFBF8"
                  borderRadius="14px"
                  border="2px solid"
                  borderColor={
                    subdomainAvailable === true
                      ? '#4C8F6D'
                      : subdomainAvailable === false
                      ? '#E53E3E'
                      : '#EFE8E0'
                  }
                  overflow="hidden"
                  align="center"
                  transition="all 0.2s"
                >
                  <Input
                    value={subdomain}
                    onChange={handleSubdomainChange}
                    placeholder="myschool"
                    border="none"
                    fontSize="16px"
                    fontWeight="500"
                    px={4}
                    py={6}
                    _focus={{ boxShadow: 'none' }}
                    _placeholder={{ color: '#B5A797' }}
                  />
                  <Flex
                    bg="#EFE8E0"
                    px={4}
                    h="full"
                    align="center"
                    minH="52px"
                  >
                    <Text fontSize="15px" color="#6F6F6A" fontWeight="500">
                      .kursi.uz
                    </Text>
                  </Flex>
                  <Flex px={3} align="center" minW="40px" justify="center">
                    {checkingSubdomain ? (
                      <Spinner size="sm" color="#6F6F6A" />
                    ) : subdomainAvailable === true ? (
                      <Icon as={FiCheck} color="#4C8F6D" boxSize={5} />
                    ) : subdomainAvailable === false ? (
                      <Icon as={FiX} color="#E53E3E" boxSize={5} />
                    ) : null}
                  </Flex>
                </Flex>
                {subdomain && (
                  <Text
                    fontSize="12px"
                    mt={2}
                    color={
                      subdomainAvailable === true
                        ? '#4C8F6D'
                        : subdomainAvailable === false
                        ? '#E53E3E'
                        : '#6F6F6A'
                    }
                  >
                    {subdomainAvailable === true
                      ? '✓ Этот адрес свободен!'
                      : subdomainAvailable === false
                      ? '✗ Этот адрес уже занят или недопустим'
                      : 'Только латинские буквы, цифры и дефис'}
                  </Text>
                )}
              </Box>

              {/* School Name */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#3E3E3C" mb={2}>
                  Название школы
                </Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Моя онлайн-школа"
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
                />
              </Box>

              {/* Description */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#3E3E3C" mb={2}>
                  Описание (необязательно)
                </Text>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите о вашей школе..."
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  fontSize="15px"
                  rows={3}
                  resize="none"
                  _focus={{
                    borderColor: '#4C8F6D',
                    boxShadow: '0 0 0 1px #4C8F6D',
                  }}
                />
              </Box>

              {/* Preview */}
              {subdomain && subdomainAvailable && (
                <Box
                  bg="#E8F5EE"
                  borderRadius="12px"
                  p={4}
                >
                  <HStack gap={2} mb={2}>
                    <Icon as={FiGlobe} color="#4C8F6D" boxSize={4} />
                    <Text fontSize="13px" fontWeight="600" color="#4C8F6D">
                      Предпросмотр адреса
                    </Text>
                  </HStack>
                  <Text fontSize="15px" color="#3E3E3C" fontWeight="500">
                    https://{subdomain}.kursi.uz
                  </Text>
                </Box>
              )}

              {/* Create Button */}
              <Button
                bg="#4C8F6D"
                color="white"
                borderRadius="14px"
                fontSize="15px"
                fontWeight="600"
                py={7}
                onClick={handleCreateSchool}
                disabled={!subdomain || !name || !subdomainAvailable || isCreating}
                _hover={{ bg: '#3F7A5C' }}
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                {isCreating ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Icon as={FiHome} mr={2} />
                    Создать школу
                  </>
                )}
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    )
  }

  // Has tenant - show info/edit
  return (
    <Box maxW="800px">
      <Box mb={8}>
        <Heading
          as="h1"
          fontSize="24px"
          fontWeight="bold"
          color="#3E3E3C"
          letterSpacing="-0.3px"
          mb={2}
        >
          Моя школа
        </Heading>
        <Text fontSize="14px" color="#6F6F6A">
          Настройки вашей онлайн-школы
        </Text>
      </Box>

      {error && (
        <Flex bg="#FDF6ED" borderRadius="12px" p={4} align="center" gap={3} mb={6}>
          <Icon as={FiX} color="#C98A4A" boxSize={5} />
          <Text fontSize="14px" color="#C98A4A" flex={1}>
            {error}
          </Text>
          <Button size="sm" variant="ghost" color="#C98A4A" onClick={() => setError(null)}>
            Закрыть
          </Button>
        </Flex>
      )}

      {/* School URL Card */}
      <Card.Root
        bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
        borderRadius="20px"
        mb={6}
        boxShadow="0 8px 32px -8px rgba(76, 143, 109, 0.4)"
      >
        <Card.Body p={8}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <HStack gap={2} mb={2}>
                <Icon as={FiGlobe} color="whiteAlpha.800" boxSize={5} />
                <Text fontSize="14px" color="whiteAlpha.800" fontWeight="500">
                  Адрес вашей школы
                </Text>
              </HStack>
              <Text fontSize="24px" fontWeight="bold" color="white">
                {tenant.subdomain}.kursi.uz
              </Text>
            </Box>
            <a
              href={`https://${tenant.subdomain}.kursi.uz`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                bg="white"
                color="#4C8F6D"
                borderRadius="12px"
                fontSize="14px"
                fontWeight="600"
                _hover={{ bg: '#FDFBF8' }}
              >
                <Icon as={FiExternalLink} mr={2} />
                Открыть сайт
              </Button>
            </a>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* School Info Card */}
      <Card.Root
        bg="white"
        borderRadius="20px"
        boxShadow="0 2px 12px -4px rgba(0,0,0,0.08)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Header p={6} pb={4}>
          <Flex justify="space-between" align="center">
            <Heading size="sm" color="#3E3E3C">
              Информация о школе
            </Heading>
            {!isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                color="#6F6F6A"
                onClick={() => setIsEditing(true)}
              >
                <Icon as={FiEdit2} mr={2} />
                Редактировать
              </Button>
            ) : (
              <HStack gap={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="#6F6F6A"
                  onClick={() => {
                    setIsEditing(false)
                    setEditName(tenant.name)
                    setEditDescription(tenant.description || '')
                  }}
                  disabled={isSaving}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="8px"
                  onClick={handleSaveChanges}
                  disabled={isSaving || !editName.trim()}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  {isSaving ? <Spinner size="xs" /> : <Icon as={FiSave} mr={1} />}
                  Сохранить
                </Button>
              </HStack>
            )}
          </Flex>
        </Card.Header>
        <Card.Body p={6} pt={0}>
          <VStack gap={5} align="stretch">
            {/* Status */}
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" color="#6F6F6A">Статус</Text>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg={tenant.status === 'active' ? '#E8F5EE' : '#FDF6ED'}
                color={tenant.status === 'active' ? '#4C8F6D' : '#C98A4A'}
              >
                {tenant.status === 'active' ? 'Активна' : 'Неактивна'}
              </Badge>
            </Flex>

            {/* Name */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Название
              </Text>
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  fontSize="15px"
                  py={5}
                  _focus={{
                    borderColor: '#4C8F6D',
                    boxShadow: '0 0 0 1px #4C8F6D',
                  }}
                />
              ) : (
                <Text fontSize="16px" color="#3E3E3C" fontWeight="500">
                  {tenant.name}
                </Text>
              )}
            </Box>

            {/* Description */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Описание
              </Text>
              {isEditing ? (
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Расскажите о вашей школе..."
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  fontSize="15px"
                  rows={3}
                  resize="none"
                  _focus={{
                    borderColor: '#4C8F6D',
                    boxShadow: '0 0 0 1px #4C8F6D',
                  }}
                />
              ) : (
                <Text fontSize="15px" color={tenant.description ? '#3E3E3C' : '#B5A797'}>
                  {tenant.description || 'Описание не добавлено'}
                </Text>
              )}
            </Box>

            {/* Created at */}
            <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="#EFE8E0">
              <Text fontSize="13px" color="#B5A797">
                Дата создания
              </Text>
              <Text fontSize="13px" color="#6F6F6A">
                {new Date(tenant.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Flex>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
