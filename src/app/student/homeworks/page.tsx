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
  Badge,
  Spinner,
  Button,
} from '@chakra-ui/react'
import {
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiX,
  FiExternalLink,
} from 'react-icons/fi'
import NextLink from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { HomeworkSubmission } from '@/types'

export default function StudentHomeworksPage() {
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'passed' | 'failed'>('all')
  const { user, fetchUser } = useAuthStore()

  // Проверяем авторизацию с задержкой
  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        window.location.href = '/login?redirect=/student/homeworks'
        return
      }
      setAuthChecked(true)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!authChecked) return

      try {
        setIsLoading(true)

        // Загружаем пользователя в store если ещё не загружен
        if (!user) {
          await fetchUser()
        }

        const data = await api.getMyHomeworks()
        setHomeworks(data)
      } catch (err) {
        console.error('Error fetching homeworks:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (authChecked) {
      fetchHomeworks()
    }
  }, [authChecked, user, fetchUser])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: HomeworkSubmission['status']) => {
    switch (status) {
      case 'passed':
        return (
          <Badge px={3} py={1} borderRadius="full" fontSize="12px" bg="#E8F5EE" color="#4C8F6D">
            <Icon as={FiCheckCircle} mr={1} /> Принято
          </Badge>
        )
      case 'failed':
        return (
          <Badge px={3} py={1} borderRadius="full" fontSize="12px" bg="#FEE2E2" color="#DC2626">
            <Icon as={FiX} mr={1} /> На доработку
          </Badge>
        )
      case 'submitted':
        return (
          <Badge px={3} py={1} borderRadius="full" fontSize="12px" bg="#FDF6ED" color="#C98A4A">
            <Icon as={FiClock} mr={1} /> На проверке
          </Badge>
        )
      default:
        return (
          <Badge px={3} py={1} borderRadius="full" fontSize="12px" bg="#FDFBF8" color="#6F6F6A">
            {status}
          </Badge>
        )
    }
  }

  const filteredHomeworks = homeworks.filter((hw) => {
    if (filter === 'all') return true
    return hw.status === filter
  })

  const stats = {
    total: homeworks.length,
    submitted: homeworks.filter((h) => h.status === 'submitted').length,
    passed: homeworks.filter((h) => h.status === 'passed').length,
    failed: homeworks.filter((h) => h.status === 'failed').length,
  }

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка домашних заданий...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box p={8}>
      {/* Page Header */}
      <Box mb={8}>
          <Heading size="lg" color="#3E3E3C" mb={2}>
            Домашние задания
          </Heading>
          <Text color="#6F6F6A">
            История ваших отправленных работ
          </Text>
        </Box>

        {/* Stats */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Card.Root
            bg="white"
            borderRadius="12px"
            border="1px solid"
            borderColor="#EFE8E0"
            flex="1"
            minW="140px"
          >
            <Card.Body p={4}>
              <Text fontSize="24px" fontWeight="bold" color="#3E3E3C">
                {stats.total}
              </Text>
              <Text fontSize="13px" color="#6F6F6A">
                Всего
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg="white"
            borderRadius="12px"
            border="1px solid"
            borderColor="#EFE8E0"
            flex="1"
            minW="140px"
          >
            <Card.Body p={4}>
              <Text fontSize="24px" fontWeight="bold" color="#C98A4A">
                {stats.submitted}
              </Text>
              <Text fontSize="13px" color="#6F6F6A">
                На проверке
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg="white"
            borderRadius="12px"
            border="1px solid"
            borderColor="#EFE8E0"
            flex="1"
            minW="140px"
          >
            <Card.Body p={4}>
              <Text fontSize="24px" fontWeight="bold" color="#4C8F6D">
                {stats.passed}
              </Text>
              <Text fontSize="13px" color="#6F6F6A">
                Принято
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg="white"
            borderRadius="12px"
            border="1px solid"
            borderColor="#EFE8E0"
            flex="1"
            minW="140px"
          >
            <Card.Body p={4}>
              <Text fontSize="24px" fontWeight="bold" color="#DC2626">
                {stats.failed}
              </Text>
              <Text fontSize="13px" color="#6F6F6A">
                На доработку
              </Text>
            </Card.Body>
          </Card.Root>
        </Flex>

        {/* Filter */}
        <HStack gap={2} mb={6}>
          {(['all', 'submitted', 'passed', 'failed'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'solid' : 'outline'}
              bg={filter === f ? '#4C8F6D' : 'white'}
              color={filter === f ? 'white' : '#6F6F6A'}
              borderColor="#EFE8E0"
              borderRadius="8px"
              onClick={() => setFilter(f)}
              _hover={{
                bg: filter === f ? '#3F7A5C' : '#FAF7F2',
              }}
            >
              {f === 'all' && 'Все'}
              {f === 'submitted' && 'На проверке'}
              {f === 'passed' && 'Принято'}
              {f === 'failed' && 'На доработку'}
            </Button>
          ))}
        </HStack>

        {/* List */}
        {filteredHomeworks.length === 0 ? (
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={12}>
              <VStack gap={4}>
                <Flex
                  w={20}
                  h={20}
                  bg="#E8F5EE"
                  borderRadius="20px"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiClipboard} boxSize={10} color="#4C8F6D" />
                </Flex>
                <Heading size="md" color="#3E3E3C">
                  {filter === 'all' ? 'Пока нет домашних заданий' : 'Нет заданий с таким статусом'}
                </Heading>
                <Text color="#6F6F6A" textAlign="center" maxW="400px">
                  {filter === 'all'
                    ? 'Вы ещё не отправляли домашние задания. Перейдите к урокам курса, чтобы выполнить задания.'
                    : 'Попробуйте выбрать другой фильтр.'}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <VStack gap={4} align="stretch">
            {filteredHomeworks.map((homework) => (
              <Card.Root
                key={homework.id}
                bg="white"
                borderRadius="16px"
                boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
                border="1px solid"
                borderColor="#EFE8E0"
              >
                <Card.Body p={6}>
                  <Flex justify="space-between" align="start" gap={4} flexWrap="wrap">
                    <Box flex={1}>
                      <HStack gap={3} mb={2}>
                        {getStatusBadge(homework.status)}
                        <Text fontSize="12px" color="#B5A797">
                          {formatDate(homework.created_at)}
                        </Text>
                      </HStack>

                      <Text fontSize="16px" fontWeight="600" color="#3E3E3C" mb={2}>
                        {homework.lesson_title}
                      </Text>

                      {homework.text_answer && (
                        <Text
                          fontSize="14px"
                          color="#6F6F6A"
                          mb={2}
                          lineClamp={2}
                        >
                          {homework.text_answer}
                        </Text>
                      )}

                      {homework.file_url && (
                        <a href={homework.file_url} target="_blank" rel="noopener noreferrer">
                          <HStack gap={1} color="#4C8F6D" fontSize="13px">
                            <Icon as={FiExternalLink} />
                            <Text textDecoration="underline">Прикреплённый файл</Text>
                          </HStack>
                        </a>
                      )}

                      {/* Feedback */}
                      {homework.feedback && (
                        <Box
                          mt={4}
                          p={4}
                          bg={homework.status === 'passed' ? '#E8F5EE' : '#FEE2E2'}
                          borderRadius="12px"
                        >
                          <Text fontSize="12px" fontWeight="600" color="#6F6F6A" mb={1}>
                            Комментарий преподавателя:
                          </Text>
                          <Text fontSize="14px" color="#3E3E3C">
                            {homework.feedback}
                          </Text>
                          {homework.checked_by_name && (
                            <Text fontSize="12px" color="#B5A797" mt={2}>
                              — {homework.checked_by_name}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Action button for failed homeworks */}
                    {homework.status === 'failed' && (
                      <NextLink href={`/student/courses/${homework.lesson}?lesson=${homework.lesson}`}>
                        <Button
                          size="sm"
                          bg="#C98A4A"
                          color="white"
                          borderRadius="8px"
                          _hover={{ opacity: 0.9 }}
                        >
                          Переделать
                        </Button>
                      </NextLink>
                    )}
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
    </Box>
  )
}
