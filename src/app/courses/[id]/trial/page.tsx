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
  Spinner,
  Image,
} from '@chakra-ui/react'
import {
  FiPlay,
  FiUser,
  FiAlertCircle,
  FiShoppingCart,
  FiArrowLeft,
} from 'react-icons/fi'
import { use } from 'react'
import NextLink from 'next/link'

interface TrialData {
  id: number
  title: string
  description?: string
  cover_url?: string
  trial_text?: string
  trial_video_url?: string
  creator: {
    id: number
    username: string
    full_name?: string
  }
  tenant_subdomain?: string
}

export default function TrialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)

  const [trial, setTrial] = useState<TrialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/courses/${courseId}/trial/`)
        if (!response.ok) {
          throw new Error('Курс не найден')
        }
        const data = await response.json()
        setTrial(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isNaN(courseId)) {
      fetchTrial()
    }
  }, [courseId])

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка пробных материалов...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error || !trial) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2" direction="column" gap={4}>
        <Icon as={FiAlertCircle} boxSize={16} color="#C98A4A" />
        <Heading size="lg" color="#3E3E3C">Пробные материалы не найдены</Heading>
        <Text color="#6F6F6A">Возможно, курс был удалён или материалы ещё не добавлены</Text>
        <NextLink href="/">
          <Button
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            _hover={{ bg: '#3F7A5C' }}
          >
            На главную
          </Button>
        </NextLink>
      </Flex>
    )
  }

  const hasTrialContent = trial.trial_text || trial.trial_video_url

  return (
    <Box minH="100vh" bg="#FAF7F2">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="#EFE8E0" py={4}>
        <Box maxW="900px" mx="auto" px={6}>
          <HStack justify="space-between">
            <NextLink href={`/courses/${courseId}`}>
              <Button
                variant="ghost"
                color="#6F6F6A"
                _hover={{ bg: '#F5F0EA' }}
                borderRadius="10px"
              >
                <Icon as={FiArrowLeft} mr={2} />
                К курсу
              </Button>
            </NextLink>
            <Text fontSize="14px" color="#6F6F6A">Пробные материалы</Text>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="900px" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Course Info */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Heading
                  as="h1"
                  fontSize={{ base: '24px', md: '32px' }}
                  fontWeight="bold"
                  color="#3E3E3C"
                  letterSpacing="-0.5px"
                >
                  {trial.title}
                </Heading>

                {trial.description && (
                  <Text fontSize="16px" color="#6F6F6A" lineHeight="1.6">
                    {trial.description}
                  </Text>
                )}

                {/* Creator */}
                <HStack gap={3} p={4} bg="#FDFBF8" borderRadius="14px">
                  <Flex
                    w={12}
                    h={12}
                    bg="#4C8F6D"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUser} boxSize={6} color="white" />
                  </Flex>
                  <Box>
                    <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
                      {trial.creator.full_name || trial.creator.username}
                    </Text>
                    <Text fontSize="13px" color="#6F6F6A">
                      Автор курса
                    </Text>
                  </Box>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Trial Content */}
          {hasTrialContent ? (
            <>
              {/* Trial Video */}
              {trial.trial_video_url && (
                <Card.Root
                  bg="white"
                  borderRadius="20px"
                  boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  overflow="hidden"
                >
                  <Card.Body p={0}>
                    <Box
                      bg="black"
                      borderRadius="20px"
                      overflow="hidden"
                    >
                      <video
                        src={trial.trial_video_url}
                        controls
                        style={{
                          width: '100%',
                          maxHeight: '500px',
                          objectFit: 'contain',
                        }}
                        poster={trial.cover_url}
                      />
                    </Box>
                  </Card.Body>
                </Card.Root>
              )}

              {/* Trial Text */}
              {trial.trial_text && (
                <Card.Root
                  bg="white"
                  borderRadius="20px"
                  boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
                  border="1px solid"
                  borderColor="#EFE8E0"
                >
                  <Card.Body p={8}>
                    <Heading size="md" color="#3E3E3C" mb={4}>
                      Пробный урок
                    </Heading>
                    <Text
                      fontSize="16px"
                      color="#3E3E3C"
                      lineHeight="1.8"
                      whiteSpace="pre-wrap"
                    >
                      {trial.trial_text}
                    </Text>
                  </Card.Body>
                </Card.Root>
              )}
            </>
          ) : (
            <Card.Root
              bg="white"
              borderRadius="20px"
              boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
            >
              <Card.Body p={8}>
                <VStack gap={4}>
                  <Icon as={FiPlay} boxSize={12} color="#C98A4A" />
                  <Heading size="md" color="#3E3E3C">
                    Пробные материалы скоро появятся
                  </Heading>
                  <Text color="#6F6F6A" textAlign="center">
                    Учитель ещё не добавил пробные материалы для этого курса.
                    Свяжитесь с учителем для получения дополнительной информации.
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}

          {/* CTA - Buy Course */}
          <Card.Root
            bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
            borderRadius="20px"
            boxShadow="0 8px 32px -8px rgba(76, 143, 109, 0.4)"
          >
            <Card.Body p={8}>
              <Flex justify="space-between" align="center" gap={6} flexWrap="wrap">
                <Box>
                  <Heading size="lg" color="white" mb={2}>
                    Понравились материалы?
                  </Heading>
                  <Text fontSize="16px" color="whiteAlpha.800">
                    Приобретите полный курс и получите доступ ко всем урокам
                  </Text>
                </Box>
                <NextLink href={`/courses/${courseId}`}>
                  <Button
                    size="lg"
                    bg="white"
                    color="#4C8F6D"
                    borderRadius="14px"
                    fontSize="16px"
                    fontWeight="600"
                    px={8}
                    h={14}
                    _hover={{ bg: '#FDFBF8', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiShoppingCart} mr={3} boxSize={5} />
                    Купить полный курс
                  </Button>
                </NextLink>
              </Flex>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>

      {/* Footer */}
      <Box bg="white" borderTop="1px solid" borderColor="#EFE8E0" py={8}>
        <Box maxW="900px" mx="auto" px={6}>
          <Text fontSize="14px" color="#6F6F6A" textAlign="center">
            Kursi — платформа для онлайн-обучения
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
