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
  Button,
  Card,
  Input,
  Spinner,
} from '@chakra-ui/react'
import {
  FiLink,
  FiCopy,
  FiRefreshCw,
  FiExternalLink,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi'
import api from '@/lib/api'
import { CreatorProfile } from '@/types'

export default function BotLinkPage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const profile = await api.getCreatorProfile()
      setProfile(profile)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; error?: string } } }
      setError(error.response?.data?.error || error.response?.data?.detail || 'Ошибка загрузки профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const result = await api.regenerateReferralKey()
      if (profile) {
        setProfile({
          ...profile,
          referral_key: result.referral_key,
          bot_link: result.bot_link,
        })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Ошибка обновления ссылки')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleCopy = () => {
    if (profile?.bot_link) {
      navigator.clipboard.writeText(profile.bot_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenBot = () => {
    if (profile?.bot_link) {
      window.open(profile.bot_link, '_blank')
    }
  }

  return (
    <Box maxW="800px">
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
          Бот-ссылка
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Используйте эту ссылку для привлечения студентов через Telegram бота
        </Text>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px">
          <VStack gap={4}>
            <Spinner size="xl" color="#4C8F6D" />
            <Text color="#6F6F6A">Загрузка...</Text>
          </VStack>
        </Flex>
      )}

      {/* Error State */}
      {error && (
        <Flex
          bg="#FDF6ED"
          borderRadius="12px"
          p={6}
          align="center"
          gap={3}
          mb={6}
        >
          <Icon as={FiAlertCircle} color="#C98A4A" boxSize={6} />
          <Text fontSize="14px" color="#C98A4A">
            {error}
          </Text>
        </Flex>
      )}

      {/* Main Content */}
      {!isLoading && profile && (
        <VStack gap={6} align="stretch">
          {/* Bot Link Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={6}>
              <VStack gap={6} align="stretch">
                <Flex
                  w={16}
                  h={16}
                  bg="#E8F5EE"
                  borderRadius="16px"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiLink} boxSize={8} color="#4C8F6D" />
                </Flex>

                <Box>
                  <Text fontSize="14px" color="#6F6F6A" mb={2}>
                    Ваша уникальная ссылка на бота
                  </Text>
                  <HStack gap={2}>
                    <Input
                      value={profile.bot_link || `https://t.me/kursi_testbot?start=${profile.referral_key}`}
                      readOnly
                      bg="#FDFBF8"
                      border="1px solid"
                      borderColor="#EFE8E0"
                      borderRadius="12px"
                      fontSize="14px"
                      _focus={{
                        borderColor: '#4C8F6D',
                        boxShadow: '0 0 0 1px #4C8F6D',
                      }}
                    />
                    <Button
                      onClick={handleCopy}
                      bg={copied ? '#4C8F6D' : 'white'}
                      color={copied ? 'white' : '#3E3E3C'}
                      border="1px solid"
                      borderColor={copied ? '#4C8F6D' : '#EFE8E0'}
                      borderRadius="12px"
                      px={4}
                      _hover={{
                        bg: copied ? '#3F7A5C' : '#FAF7F2',
                      }}
                    >
                      <Icon as={copied ? FiCheck : FiCopy} boxSize={4} />
                    </Button>
                    <Button
                      onClick={handleOpenBot}
                      bg="white"
                      color="#3E3E3C"
                      border="1px solid"
                      borderColor="#EFE8E0"
                      borderRadius="12px"
                      px={4}
                      _hover={{
                        bg: '#FAF7F2',
                      }}
                    >
                      <Icon as={FiExternalLink} boxSize={4} />
                    </Button>
                  </HStack>
                </Box>

                <Box
                  bg="#FDFBF8"
                  borderRadius="12px"
                  p={4}
                >
                  <Text fontSize="13px" color="#6F6F6A" lineHeight="1.6">
                    Поделитесь этой ссылкой в социальных сетях, на своем сайте или в мессенджерах.
                    Когда пользователь перейдет по ссылке и начнет общение с ботом, он автоматически
                    будет привязан к вашему профилю как лид.
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Referral Key Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={6}>
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="#3E3E3C" mb={1}>
                    Реферальный ключ
                  </Text>
                  <Text fontSize="14px" color="#6F6F6A" mb={3}>
                    Уникальный идентификатор вашей ссылки
                  </Text>
                  <Text
                    fontSize="18px"
                    fontWeight="bold"
                    color="#4C8F6D"
                    fontFamily="mono"
                  >
                    {profile.referral_key}
                  </Text>
                </Box>

                <Button
                  onClick={handleRegenerate}
                  loading={isRegenerating}
                  variant="outline"
                  borderColor="#EFE8E0"
                  color="#6F6F6A"
                  borderRadius="12px"
                  _hover={{
                    borderColor: '#C98A4A',
                    color: '#C98A4A',
                  }}
                >
                  <Icon as={FiRefreshCw} mr={2} boxSize={4} />
                  Обновить
                </Button>
              </HStack>

              <Box
                bg="#FDF6ED"
                borderRadius="12px"
                p={4}
                mt={4}
              >
                <HStack gap={2} align="start">
                  <Icon as={FiAlertCircle} color="#C98A4A" boxSize={4} mt={0.5} />
                  <Text fontSize="13px" color="#C98A4A" lineHeight="1.6">
                    При обновлении ключа старая ссылка перестанет работать.
                    Все уже привязанные лиды сохранятся.
                  </Text>
                </HStack>
              </Box>
            </Card.Body>
          </Card.Root>

          {/* Stats Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={6}>
              <Text fontSize="16px" fontWeight="600" color="#3E3E3C" mb={4}>
                Статистика
              </Text>
              <HStack gap={8}>
                <Box>
                  <Text fontSize="28px" fontWeight="bold" color="#4C8F6D">
                    {profile.leads_count || 0}
                  </Text>
                  <Text fontSize="13px" color="#6F6F6A">
                    Всего лидов
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                    {profile.courses_count || 0}
                  </Text>
                  <Text fontSize="13px" color="#6F6F6A">
                    Курсов
                  </Text>
                </Box>
              </HStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      )}

      {/* No Profile State */}
      {!isLoading && !profile && !error && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="300px"
          bg="white"
          borderRadius="20px"
          border="2px dashed"
          borderColor="#DDE8DD"
          p={8}
        >
          <Flex
            w={20}
            h={20}
            bg="#E8F5EE"
            borderRadius="full"
            align="center"
            justify="center"
            mb={6}
          >
            <Icon as={FiLink} boxSize={10} color="#4C8F6D" />
          </Flex>
          <Heading as="h3" fontSize="20px" color="#3E3E3C" mb={2}>
            Профиль не найден
          </Heading>
          <Text color="#6F6F6A" fontSize="15px" textAlign="center" maxW="300px">
            Профиль создателя будет создан автоматически при первом входе
          </Text>
        </Flex>
      )}
    </Box>
  )
}
