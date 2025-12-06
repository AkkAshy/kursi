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
  Input,
  SimpleGrid,
  Image,
  Button,
} from '@chakra-ui/react'
import {
  FiSearch,
  FiBook,
  FiUsers,
  FiPlay,
  FiUser,
  FiShoppingCart,
} from 'react-icons/fi'
import NextLink from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { StudentSidebar } from '@/components/layout/StudentSidebar'

interface PublicCourse {
  id: number
  title: string
  description?: string
  price: number
  cover_url?: string
  preview_video_url?: string
  lessons_count: number
  students_count: number
  creator?: {
    id: number
    username: string
    full_name?: string
  }
  created_at: string
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high'>('newest')
  const { user, fetchUser } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  // Проверяем авторизацию
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated() && !user) {
        try {
          await fetchUser()
        } catch {
          // Игнорируем ошибки
        }
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [user, fetchUser])

  const isStudent = authChecked && user?.role === 'student'

  useEffect(() => {
    const fetchCourses = async () => {
      if (!authChecked) return

      try {
        setIsLoading(true)
        // Для авторизованных студентов - рекомендуемые курсы от их учителей
        // Для остальных - публичные курсы tenant'а
        if (isStudent) {
          const data = await api.getRecommendedCourses()
          setCourses(data)
        } else {
          const data = await api.getPublicCourses()
          setCourses(data)
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [authChecked, isStudent])

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно'
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  // Фильтрация по поиску
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.creator?.full_name?.toLowerCase().includes(query) ||
      course.creator?.username?.toLowerCase().includes(query)
    )
  })

  // Сортировка
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'popular':
        return b.students_count - a.students_count
      case 'price_low':
        return a.price - b.price
      case 'price_high':
        return b.price - a.price
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <Flex minH="100vh" bg="#FAF7F2">
        {isStudent && <StudentSidebar />}
        <Flex
          flex={1}
          minH="100vh"
          align="center"
          justify="center"
          ml={isStudent ? { base: 0, md: '280px' } : 0}
        >
          <VStack gap={4}>
            <Spinner size="xl" color="#4C8F6D" />
            <Text color="#6F6F6A">Загрузка курсов...</Text>
          </VStack>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex minH="100vh" bg="#FAF7F2">
      {isStudent && <StudentSidebar />}
      <Box flex={1} ml={isStudent ? { base: 0, md: '280px' } : 0}>
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="#EFE8E0">
        <Box maxW="1200px" mx="auto" px={6} py={8}>
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading
                as="h1"
                fontSize={{ base: '28px', md: '36px' }}
                fontWeight="bold"
                color="#3E3E3C"
                letterSpacing="-0.5px"
              >
                {isStudent ? 'Рекомендуемые курсы' : 'Каталог курсов'}
              </Heading>
              <Text fontSize="16px" color="#6F6F6A" mt={2}>
                {isStudent
                  ? courses.length > 0
                    ? `Ещё ${courses.length} ${courses.length === 1 ? 'курс' : courses.length < 5 ? 'курса' : 'курсов'} от ваших учителей`
                    : 'Нет новых курсов от ваших учителей'
                  : `${courses.length} ${courses.length === 1 ? 'курс' : courses.length < 5 ? 'курса' : 'курсов'} доступно`
                }
              </Text>
            </Box>
            {!isStudent && (
              <NextLink href="/">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="#4C8F6D"
                  letterSpacing="-0.5px"
                >
                  Kursi
                </Text>
              </NextLink>
            )}
          </Flex>

          {/* Search & Filters */}
          <Flex gap={4} flexWrap="wrap">
            {/* Search */}
            <Box flex={1} minW="280px" position="relative">
              <Icon
                as={FiSearch}
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                color="#6F6F6A"
                boxSize={5}
              />
              <Input
                placeholder="Поиск курсов по названию или автору..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl={12}
                pr={4}
                h={12}
                borderRadius="12px"
                borderColor="#EFE8E0"
                bg="white"
                _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                _placeholder={{ color: '#B5A797' }}
              />
            </Box>

            {/* Sort */}
            <HStack gap={2}>
              {(['newest', 'popular', 'price_low', 'price_high'] as const).map((sort) => (
                <Button
                  key={sort}
                  size="md"
                  variant={sortBy === sort ? 'solid' : 'outline'}
                  bg={sortBy === sort ? '#4C8F6D' : 'white'}
                  color={sortBy === sort ? 'white' : '#6F6F6A'}
                  borderColor="#EFE8E0"
                  borderRadius="10px"
                  h={12}
                  onClick={() => setSortBy(sort)}
                  _hover={{
                    bg: sortBy === sort ? '#3F7A5C' : '#FAF7F2',
                  }}
                >
                  {sort === 'newest' && 'Новые'}
                  {sort === 'popular' && 'Популярные'}
                  {sort === 'price_low' && 'Дешевле'}
                  {sort === 'price_high' && 'Дороже'}
                </Button>
              ))}
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Courses Grid */}
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        {sortedCourses.length === 0 ? (
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
                  <Icon as={FiSearch} boxSize={10} color="#4C8F6D" />
                </Flex>
                <Heading size="md" color="#3E3E3C">
                  {searchQuery ? 'Ничего не найдено' : 'Пока нет курсов'}
                </Heading>
                <Text color="#6F6F6A" textAlign="center" maxW="400px">
                  {searchQuery
                    ? `По запросу "${searchQuery}" курсов не найдено. Попробуйте изменить запрос.`
                    : 'Скоро здесь появятся интересные курсы!'}
                </Text>
                {searchQuery && (
                  <Button
                    variant="outline"
                    color="#4C8F6D"
                    borderColor="#4C8F6D"
                    borderRadius="10px"
                    onClick={() => setSearchQuery('')}
                    _hover={{ bg: '#E8F5EE' }}
                  >
                    Сбросить поиск
                  </Button>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} formatPrice={formatPrice} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Footer - только для неавторизованных */}
      {!isStudent && (
        <Box bg="white" borderTop="1px solid" borderColor="#EFE8E0" py={8}>
          <Box maxW="1200px" mx="auto" px={6}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <Text fontSize="14px" color="#6F6F6A">
                Kursi — платформа для онлайн-обучения
              </Text>
              <HStack gap={4}>
                <NextLink href="/login">
                  <Text fontSize="14px" color="#4C8F6D" fontWeight="500">
                    Войти
                  </Text>
                </NextLink>
                <NextLink href="/register">
                  <Text fontSize="14px" color="#4C8F6D" fontWeight="500">
                    Регистрация
                  </Text>
                </NextLink>
              </HStack>
            </Flex>
          </Box>
        </Box>
      )}
      </Box>
    </Flex>
  )
}

function CourseCard({
  course,
  formatPrice,
}: {
  course: PublicCourse
  formatPrice: (price: number) => string
}) {
  return (
    <NextLink href={`/courses/${course.id}`}>
      <Card.Root
        bg="white"
        borderRadius="20px"
        boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        overflow="hidden"
        transition="all 0.2s"
        cursor="pointer"
        h="full"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)',
          borderColor: '#4C8F6D',
        }}
      >
        {/* Cover */}
        {course.cover_url ? (
          <Image
            src={course.cover_url}
            alt={course.title}
            h="180px"
            w="full"
            objectFit="cover"
          />
        ) : (
          <Flex
            h="180px"
            bg="linear-gradient(135deg, #4C8F6D 0%, #3F7A5C 100%)"
            align="center"
            justify="center"
          >
            <Icon as={FiPlay} boxSize={12} color="white" opacity={0.8} />
          </Flex>
        )}

        <Card.Body p={5}>
          <VStack align="stretch" gap={4}>
            {/* Title & Description */}
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
              {course.description && (
                <Text
                  fontSize="13px"
                  color="#6F6F6A"
                  lineClamp={2}
                  lineHeight="1.5"
                >
                  {course.description}
                </Text>
              )}
            </Box>

            {/* Author */}
            {course.creator && (
              <HStack gap={2}>
                <Flex
                  w={7}
                  h={7}
                  bg="#E8F5EE"
                  borderRadius="8px"
                  align="center"
                  justify="center"
                >
                  <Icon as={FiUser} boxSize={3.5} color="#4C8F6D" />
                </Flex>
                <Text fontSize="13px" color="#6F6F6A">
                  {course.creator.full_name || course.creator.username}
                </Text>
              </HStack>
            )}

            {/* Stats */}
            <HStack gap={4}>
              <HStack gap={1}>
                <Icon as={FiBook} boxSize={4} color="#6F6F6A" />
                <Text fontSize="13px" color="#6F6F6A">
                  {course.lessons_count} {course.lessons_count === 1 ? 'урок' : 'уроков'}
                </Text>
              </HStack>
              <HStack gap={1}>
                <Icon as={FiUsers} boxSize={4} color="#6F6F6A" />
                <Text fontSize="13px" color="#6F6F6A">
                  {course.students_count}
                </Text>
              </HStack>
            </HStack>

            {/* Price */}
            <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="#EFE8E0">
              <Text fontSize="18px" fontWeight="bold" color="#4C8F6D">
                {formatPrice(course.price)}
              </Text>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg="#E8F5EE"
                color="#4C8F6D"
              >
                <Icon as={FiShoppingCart} mr={1} />
                Купить
              </Badge>
            </Flex>
          </VStack>
        </Card.Body>
      </Card.Root>
    </NextLink>
  )
}
