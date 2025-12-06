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
  Badge,
  Spinner,
  Image,
} from '@chakra-ui/react'
import {
  FiPlay,
  FiUsers,
  FiBook,
  FiClock,
  FiShoppingCart,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi'
import { use } from 'react'
import api from '@/lib/api'
import NextLink from 'next/link'

interface PublicCourse {
  id: number
  title: string
  description?: string
  price: number
  cover_url?: string
  preview_video_url?: string
  lessons_count: number
  students_count: number
  creator: {
    id: number
    username: string
    full_name?: string
  }
  created_at: string
}

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)

  const [course, setCourse] = useState<PublicCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        const data = await api.getPublicCourse(courseId)
        setCourse(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Курс не найден'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isNaN(courseId)) {
      fetchCourse()
    }
  }, [courseId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка курса...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error || !course) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2" direction="column" gap={4}>
        <Icon as={FiAlertCircle} boxSize={16} color="#C98A4A" />
        <Heading size="lg" color="#3E3E3C">Курс не найден</Heading>
        <Text color="#6F6F6A">Возможно, курс был удален или ещё не опубликован</Text>
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

  return (
    <Box minH="100vh" bg="#FAF7F2">
      {/* Hero Section */}
      <Box bg="white" borderBottom="1px solid" borderColor="#EFE8E0">
        <Box maxW="1200px" mx="auto" px={6} py={12}>
          <Flex gap={10} direction={{ base: 'column', lg: 'row' }}>
            {/* Course Preview Video / Image */}
            <Box flex={1} maxW={{ lg: '600px' }}>
              {course.preview_video_url ? (
                <Box
                  borderRadius="20px"
                  overflow="hidden"
                  boxShadow="0 8px 32px -8px rgba(0,0,0,0.12)"
                  bg="black"
                >
                  <video
                    src={course.preview_video_url}
                    controls
                    style={{ width: '100%', height: '340px', objectFit: 'contain' }}
                    poster={course.cover_url}
                  />
                </Box>
              ) : course.cover_url ? (
                <Image
                  src={course.cover_url}
                  alt={course.title}
                  borderRadius="20px"
                  w="full"
                  h="340px"
                  objectFit="cover"
                  boxShadow="0 8px 32px -8px rgba(0,0,0,0.12)"
                />
              ) : (
                <Flex
                  w="full"
                  h="340px"
                  bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
                  borderRadius="20px"
                  align="center"
                  justify="center"
                  boxShadow="0 8px 32px -8px rgba(76, 143, 109, 0.3)"
                >
                  <Icon as={FiPlay} boxSize={20} color="white" opacity={0.8} />
                </Flex>
              )}
            </Box>

            {/* Course Info */}
            <VStack flex={1} align="stretch" gap={6}>
              <Box>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight="600"
                  bg="#E8F5EE"
                  color="#4C8F6D"
                  mb={3}
                >
                  Онлайн-курс
                </Badge>
                <Heading
                  as="h1"
                  fontSize={{ base: '28px', md: '36px' }}
                  fontWeight="bold"
                  color="#3E3E3C"
                  letterSpacing="-0.5px"
                  lineHeight="1.2"
                >
                  {course.title}
                </Heading>
              </Box>

              {course.description && (
                <Text fontSize="16px" color="#6F6F6A" lineHeight="1.6">
                  {course.description}
                </Text>
              )}

              {/* Stats */}
              <HStack gap={6} flexWrap="wrap">
                <HStack gap={2}>
                  <Flex
                    w={10}
                    h={10}
                    bg="#E8F5EE"
                    borderRadius="10px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiBook} boxSize={5} color="#4C8F6D" />
                  </Flex>
                  <Box>
                    <Text fontSize="18px" fontWeight="700" color="#3E3E3C">
                      {course.lessons_count}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      {course.lessons_count === 1 ? 'урок' : course.lessons_count < 5 ? 'урока' : 'уроков'}
                    </Text>
                  </Box>
                </HStack>

                <HStack gap={2}>
                  <Flex
                    w={10}
                    h={10}
                    bg="#FDF6ED"
                    borderRadius="10px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUsers} boxSize={5} color="#C98A4A" />
                  </Flex>
                  <Box>
                    <Text fontSize="18px" fontWeight="700" color="#3E3E3C">
                      {course.students_count}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      студентов
                    </Text>
                  </Box>
                </HStack>
              </HStack>

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
                    {course.creator.full_name || course.creator.username}
                  </Text>
                  <Text fontSize="13px" color="#6F6F6A">
                    Автор курса
                  </Text>
                </Box>
              </HStack>

              {/* Price & Buy Button */}
              <Card.Root
                bg="white"
                borderRadius="16px"
                border="2px solid"
                borderColor="#4C8F6D"
                boxShadow="0 4px 24px -4px rgba(76, 143, 109, 0.15)"
              >
                <Card.Body p={6}>
                  <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                    <Box>
                      <Text fontSize="14px" color="#6F6F6A" mb={1}>
                        Стоимость курса
                      </Text>
                      <Text fontSize="32px" fontWeight="bold" color="#4C8F6D">
                        {formatPrice(course.price)}
                      </Text>
                    </Box>
                    <NextLink href={api.isAuthenticated() ? `/courses/${course.id}/buy` : `/login?redirect=/courses/${course.id}/buy`}>
                      <Button
                        size="lg"
                        bg="#4C8F6D"
                        color="white"
                        borderRadius="14px"
                        fontSize="16px"
                        fontWeight="600"
                        px={8}
                        h={14}
                        boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.4)"
                        _hover={{ bg: '#3F7A5C', transform: 'translateY(-2px)' }}
                        transition="all 0.2s"
                      >
                        <Icon as={FiShoppingCart} mr={3} boxSize={5} />
                        Купить курс
                      </Button>
                    </NextLink>
                  </Flex>
                </Card.Body>
              </Card.Root>
            </VStack>
          </Flex>
        </Box>
      </Box>

      {/* Course Details Section */}
      <Box maxW="1200px" mx="auto" px={6} py={12}>
        <VStack gap={8} align="stretch">
          {/* What you'll learn */}
          <Card.Root
            bg="white"
            borderRadius="20px"
            boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={8}>
              <Heading size="md" color="#3E3E3C" mb={6}>
                О курсе
              </Heading>
              <Text fontSize="16px" color="#6F6F6A" lineHeight="1.8">
                {course.description || 'Описание курса скоро появится. Следите за обновлениями!'}
              </Text>
            </Card.Body>
          </Card.Root>

          {/* Course Stats */}
          <Flex gap={6} flexWrap="wrap">
            <Card.Root
              flex={1}
              minW="200px"
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
            >
              <Card.Body p={6}>
                <HStack gap={4}>
                  <Flex
                    w={14}
                    h={14}
                    bg="#E8F5EE"
                    borderRadius="14px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiBook} boxSize={7} color="#4C8F6D" />
                  </Flex>
                  <Box>
                    <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                      {course.lessons_count}
                    </Text>
                    <Text fontSize="14px" color="#6F6F6A">
                      Уроков в курсе
                    </Text>
                  </Box>
                </HStack>
              </Card.Body>
            </Card.Root>

            <Card.Root
              flex={1}
              minW="200px"
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
            >
              <Card.Body p={6}>
                <HStack gap={4}>
                  <Flex
                    w={14}
                    h={14}
                    bg="#FDF6ED"
                    borderRadius="14px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUsers} boxSize={7} color="#C98A4A" />
                  </Flex>
                  <Box>
                    <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                      {course.students_count}
                    </Text>
                    <Text fontSize="14px" color="#6F6F6A">
                      Студентов обучается
                    </Text>
                  </Box>
                </HStack>
              </Card.Body>
            </Card.Root>

            <Card.Root
              flex={1}
              minW="200px"
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
            >
              <Card.Body p={6}>
                <HStack gap={4}>
                  <Flex
                    w={14}
                    h={14}
                    bg="#E8F5EE"
                    borderRadius="14px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiClock} boxSize={7} color="#4C8F6D" />
                  </Flex>
                  <Box>
                    <Text fontSize="28px" fontWeight="bold" color="#3E3E3C">
                      24/7
                    </Text>
                    <Text fontSize="14px" color="#6F6F6A">
                      Доступ к материалам
                    </Text>
                  </Box>
                </HStack>
              </Card.Body>
            </Card.Root>
          </Flex>

          {/* CTA */}
          <Card.Root
            bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
            borderRadius="20px"
            boxShadow="0 8px 32px -8px rgba(76, 143, 109, 0.4)"
          >
            <Card.Body p={10}>
              <Flex justify="space-between" align="center" gap={6} flexWrap="wrap">
                <Box>
                  <Heading size="lg" color="white" mb={2}>
                    Готовы начать обучение?
                  </Heading>
                  <Text fontSize="16px" color="whiteAlpha.800">
                    Получите полный доступ ко всем урокам курса
                  </Text>
                </Box>
                <NextLink href={api.isAuthenticated() ? `/courses/${course.id}/buy` : `/login?redirect=/courses/${course.id}/buy`}>
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
                    Купить за {formatPrice(course.price)}
                  </Button>
                </NextLink>
              </Flex>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>

      {/* Footer */}
      <Box bg="white" borderTop="1px solid" borderColor="#EFE8E0" py={8}>
        <Box maxW="1200px" mx="auto" px={6}>
          <Text fontSize="14px" color="#6F6F6A" textAlign="center">
            Kursi — платформа для онлайн-обучения
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
