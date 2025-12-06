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
  Progress,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FiBook,
  FiPlay,
  FiUser,
} from 'react-icons/fi'
import NextLink from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface StudentCourse {
  id: number
  title: string
  description?: string
  cover_url?: string
  lessons_count: number
  creator: {
    id: number
    username: string
    full_name?: string
  }
  progress_percentage: number
  completed_lessons: number
  granted_at: string
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { user, fetchUser } = useAuthStore()

  // Проверяем авторизацию с задержкой
  useEffect(() => {
    const checkAuth = () => {
      if (!api.isAuthenticated()) {
        window.location.href = '/login?redirect=/student'
        return
      }
      setAuthChecked(true)
    }

    // Даём время на загрузку токена из localStorage
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

        const coursesData = await api.getStudentCourses()
        setCourses(coursesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        // Если ошибка 401 - редирект на логин
        if (err instanceof Error && err.message.includes('401')) {
          window.location.href = '/login?redirect=/student'
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (authChecked) {
      fetchData()
    }
  }, [authChecked, user, fetchUser])

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box p={8}>
      {/* Page Header */}
      <Box mb={8}>
          <Heading size="lg" color="#3E3E3C" mb={2}>
            Мои курсы
          </Heading>
          <Text color="#6F6F6A">
            {courses.length > 0
              ? `У вас ${courses.length} ${courses.length === 1 ? 'курс' : courses.length < 5 ? 'курса' : 'курсов'}`
              : 'Начните обучение прямо сейчас'}
          </Text>
        </Box>

        {courses.length === 0 ? (
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
                  <Icon as={FiBook} boxSize={10} color="#4C8F6D" />
                </Flex>
                <Heading size="md" color="#3E3E3C">
                  Пока нет курсов
                </Heading>
                <Text color="#6F6F6A" textAlign="center" maxW="400px">
                  Вы ещё не приобрели ни одного курса. Свяжитесь с учителем или перейдите на страницу курса для покупки.
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </SimpleGrid>
        )}
    </Box>
  )
}

function CourseCard({ course }: { course: StudentCourse }) {
  return (
    <NextLink href={`/student/courses/${course.id}`}>
      <Card.Root
        bg="white"
        borderRadius="20px"
        boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        overflow="hidden"
        transition="all 0.2s"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)',
          borderColor: '#4C8F6D',
        }}
      >
        {/* Course Cover */}
        {course.cover_url ? (
          <Box
            h="160px"
            style={{
              backgroundImage: `url(${course.cover_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <Flex
            h="160px"
            bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
            align="center"
            justify="center"
          >
            <Icon as={FiPlay} boxSize={12} color="white" opacity={0.8} />
          </Flex>
        )}

        <Card.Body p={5}>
          <VStack align="stretch" gap={4}>
            {/* Title */}
            <Box>
              <Heading
                size="sm"
                color="#3E3E3C"
                lineHeight="1.4"
                mb={2}
                lineClamp={2}
              >
                {course.title}
              </Heading>
              <HStack gap={2}>
                <Icon as={FiUser} boxSize={3} color="#6F6F6A" />
                <Text fontSize="13px" color="#6F6F6A">
                  {course.creator.full_name || course.creator.username}
                </Text>
              </HStack>
            </Box>

            {/* Progress */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="13px" color="#6F6F6A">
                  Прогресс
                </Text>
                <Text fontSize="13px" fontWeight="600" color="#4C8F6D">
                  {course.progress_percentage}%
                </Text>
              </Flex>
              <Progress.Root
                value={course.progress_percentage}
                size="sm"
                borderRadius="full"
              >
                <Progress.Track bg="#E8F5EE" borderRadius="full">
                  <Progress.Range bg="#4C8F6D" borderRadius="full" />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="12px" color="#B5A797" mt={2}>
                {course.completed_lessons} из {course.lessons_count} уроков
              </Text>
            </Box>

            {/* Status Badge */}
            {course.progress_percentage === 100 ? (
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg="#E8F5EE"
                color="#4C8F6D"
                textAlign="center"
              >
                Курс завершён
              </Badge>
            ) : course.progress_percentage > 0 ? (
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg="#FDF6ED"
                color="#C98A4A"
                textAlign="center"
              >
                В процессе
              </Badge>
            ) : (
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg="#FDFBF8"
                color="#6F6F6A"
                textAlign="center"
              >
                Не начат
              </Badge>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </NextLink>
  )
}
