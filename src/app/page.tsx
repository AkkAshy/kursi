'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  Icon,
  Flex,
  Link as ChakraLink,
  Spinner,
  Image,
  Badge,
} from '@chakra-ui/react'
import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiMessageCircle,
  FiPlay,
  FiShoppingCart,
  FiArrowRight,
} from 'react-icons/fi'
import NextLink from 'next/link'
import api from '@/lib/api'

// Check if we're on a subdomain
function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname

  // For localhost - check if demo tenant exists
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'demo'
  }

  // Ignore vercel and other non-production domains
  if (hostname.includes('vercel.app')) {
    return null
  }

  const parts = hostname.split('.')
  // Check if this is a subdomain (e.g., kanat.kursi.uz)
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0]
  }
  return null
}

interface TenantInfo {
  name: string
  subdomain: string
  description?: string
  logo_url?: string
  primary_color?: string
}

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

const features = [
  {
    icon: FiBook,
    title: 'Создавайте курсы',
    description: 'Загружайте видео, добавляйте текстовые материалы и структурируйте обучение',
  },
  {
    icon: FiUsers,
    title: 'Привлекайте студентов',
    description: 'Telegram-бот автоматически собирает лиды и отправляет пробные материалы',
  },
  {
    icon: FiTrendingUp,
    title: 'Отслеживайте прогресс',
    description: 'Детальная аналитика по каждому студенту и курсу',
  },
  {
    icon: FiMessageCircle,
    title: 'Общайтесь со студентами',
    description: 'Встроенные инструменты для обратной связи и поддержки',
  },
]

export default function HomePage() {
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [courses, setCourses] = useState<PublicCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSchoolPage, setIsSchoolPage] = useState(false)

  useEffect(() => {
    const checkSubdomain = async () => {
      const sub = getSubdomain()
      setSubdomain(sub)

      if (sub) {
        // We're on a subdomain, try to load school data
        try {
          const [tenantData, coursesData] = await Promise.all([
            api.getTenantInfo(),
            api.getPublicCourses(),
          ])
          setTenant(tenantData)
          setCourses(coursesData)
          setIsSchoolPage(true)
        } catch (err) {
          // Tenant not found, show main page
          console.error('Tenant not found:', err)
          setIsSchoolPage(false)
        }
      }
      setIsLoading(false)
    }

    checkSubdomain()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно'
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  // Show loading while determining if this is a school page
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#FAF7F2">
        <Spinner size="xl" color="#4C8F6D" />
      </Flex>
    )
  }

  // If we're on a subdomain and tenant exists, show school landing page
  if (isSchoolPage && tenant) {
    const primaryColor = tenant.primary_color || '#4C8F6D'

    return (
      <Box minH="100vh" bg="#FAF7F2">
        {/* Header */}
        <Box as="header" bg="white" borderBottom="1px solid" borderColor="#EFE8E0" py={4}>
          <Container maxW="1200px">
            <Flex justify="space-between" align="center">
              <HStack gap={3}>
                {tenant.logo_url ? (
                  <Image
                    src={tenant.logo_url}
                    alt={tenant.name}
                    h="40px"
                    objectFit="contain"
                  />
                ) : (
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={primaryColor}
                    letterSpacing="-0.5px"
                  >
                    {tenant.name}
                  </Text>
                )}
              </HStack>
              <HStack gap={4}>
                <NextLink href="/courses">
                  <Button variant="ghost" size="sm" color="#6F6F6A">
                    Курсы
                  </Button>
                </NextLink>
                <NextLink href="/login">
                  <Button variant="ghost" size="sm" color="#6F6F6A">
                    Войти
                  </Button>
                </NextLink>
                <NextLink href="/register">
                  <Button
                    size="sm"
                    bg={primaryColor}
                    color="white"
                    borderRadius="10px"
                    _hover={{ opacity: 0.9 }}
                  >
                    Регистрация
                  </Button>
                </NextLink>
              </HStack>
            </Flex>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box
          py={{ base: 16, md: 24 }}
          bg={`linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`}
        >
          <Container maxW="1200px">
            <VStack gap={8} textAlign="center" maxW="800px" mx="auto">
              {tenant.logo_url && (
                <Image
                  src={tenant.logo_url}
                  alt={tenant.name}
                  h="80px"
                  objectFit="contain"
                />
              )}
              <Heading
                as="h1"
                fontSize={{ base: '32px', md: '48px' }}
                fontWeight="bold"
                color="#3E3E3C"
                lineHeight="1.2"
                letterSpacing="-1px"
              >
                Добро пожаловать в{' '}
                <Text as="span" color={primaryColor}>
                  {tenant.name}
                </Text>
              </Heading>
              {tenant.description && (
                <Text fontSize={{ base: 'md', md: 'lg' }} color="#6F6F6A" maxW="600px">
                  {tenant.description}
                </Text>
              )}
              <HStack gap={4}>
                <NextLink href="/courses">
                  <Button
                    size="lg"
                    bg={primaryColor}
                    color="white"
                    borderRadius="14px"
                    px={8}
                    h={14}
                    fontSize="16px"
                    fontWeight="600"
                    _hover={{ opacity: 0.9, transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Смотреть курсы
                    <Icon as={FiArrowRight} ml={2} />
                  </Button>
                </NextLink>
              </HStack>
            </VStack>
          </Container>
        </Box>

        {/* Stats Section */}
        <Box py={12} bg="white">
          <Container maxW="1200px">
            <SimpleGrid columns={{ base: 2, md: 3 }} gap={8}>
              <VStack>
                <Text fontSize="40px" fontWeight="bold" color={primaryColor}>
                  {courses.length}
                </Text>
                <Text fontSize="16px" color="#6F6F6A">
                  {courses.length === 1 ? 'Курс' : courses.length < 5 ? 'Курса' : 'Курсов'}
                </Text>
              </VStack>
              <VStack>
                <Text fontSize="40px" fontWeight="bold" color={primaryColor}>
                  {courses.reduce((sum, c) => sum + c.students_count, 0)}
                </Text>
                <Text fontSize="16px" color="#6F6F6A">
                  Студентов
                </Text>
              </VStack>
              <VStack display={{ base: 'none', md: 'flex' }}>
                <Text fontSize="40px" fontWeight="bold" color={primaryColor}>
                  {courses.reduce((sum, c) => sum + c.lessons_count, 0)}
                </Text>
                <Text fontSize="16px" color="#6F6F6A">
                  Уроков
                </Text>
              </VStack>
            </SimpleGrid>
          </Container>
        </Box>

        {/* Courses Section */}
        {courses.length > 0 && (
          <Box py={{ base: 12, md: 16 }}>
            <Container maxW="1200px">
              <VStack gap={10}>
                <Box textAlign="center">
                  <Heading size="lg" color="#3E3E3C" mb={3}>
                    Наши курсы
                  </Heading>
                  <Text color="#6F6F6A" maxW="500px" mx="auto">
                    Выберите курс и начните обучение прямо сейчас
                  </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
                  {courses.slice(0, 6).map((course) => (
                    <NextLink key={course.id} href={`/courses/${course.id}`}>
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
                          borderColor: primaryColor,
                        }}
                      >
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
                            bg={`linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`}
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiPlay} boxSize={12} color="white" opacity={0.8} />
                          </Flex>
                        )}

                        <Card.Body p={5}>
                          <VStack align="stretch" gap={4}>
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
                                <Text fontSize="13px" color="#6F6F6A" lineClamp={2}>
                                  {course.description}
                                </Text>
                              )}
                            </Box>

                            <HStack gap={4}>
                              <HStack gap={1}>
                                <Icon as={FiBook} boxSize={4} color="#6F6F6A" />
                                <Text fontSize="13px" color="#6F6F6A">
                                  {course.lessons_count} уроков
                                </Text>
                              </HStack>
                              <HStack gap={1}>
                                <Icon as={FiUsers} boxSize={4} color="#6F6F6A" />
                                <Text fontSize="13px" color="#6F6F6A">
                                  {course.students_count}
                                </Text>
                              </HStack>
                            </HStack>

                            <Flex
                              justify="space-between"
                              align="center"
                              pt={3}
                              borderTop="1px solid"
                              borderColor="#EFE8E0"
                            >
                              <Text fontSize="18px" fontWeight="bold" color={primaryColor}>
                                {formatPrice(course.price)}
                              </Text>
                              <Badge
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="12px"
                                fontWeight="600"
                                bg={`${primaryColor}15`}
                                color={primaryColor}
                              >
                                <Icon as={FiShoppingCart} mr={1} />
                                Подробнее
                              </Badge>
                            </Flex>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    </NextLink>
                  ))}
                </SimpleGrid>

                {courses.length > 6 && (
                  <NextLink href="/courses">
                    <Button
                      variant="outline"
                      size="lg"
                      borderColor={primaryColor}
                      color={primaryColor}
                      borderRadius="14px"
                      px={8}
                      _hover={{ bg: `${primaryColor}10` }}
                    >
                      Смотреть все курсы ({courses.length})
                      <Icon as={FiArrowRight} ml={2} />
                    </Button>
                  </NextLink>
                )}
              </VStack>
            </Container>
          </Box>
        )}

        {/* CTA Section */}
        <Box py={{ base: 12, md: 16 }}>
          <Container maxW="1200px">
            <Card.Root
              bg={`linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`}
              borderRadius="24px"
              boxShadow={`0 8px 32px -8px ${primaryColor}60`}
            >
              <Card.Body py={12} px={8}>
                <VStack gap={6} textAlign="center">
                  <Heading size="lg" color="white">
                    Готовы начать обучение?
                  </Heading>
                  <Text color="whiteAlpha.900" maxW="500px">
                    Зарегистрируйтесь и получите доступ к курсам {tenant.name}
                  </Text>
                  <HStack gap={4} flexWrap="wrap" justify="center">
                    <NextLink href="/register">
                      <Button
                        size="lg"
                        bg="white"
                        color={primaryColor}
                        borderRadius="14px"
                        px={8}
                        h={14}
                        fontWeight="600"
                        _hover={{ bg: '#FDFBF8', transform: 'translateY(-2px)' }}
                        transition="all 0.2s"
                      >
                        Зарегистрироваться
                      </Button>
                    </NextLink>
                    <NextLink href="/courses">
                      <Button
                        size="lg"
                        variant="outline"
                        borderColor="white"
                        color="white"
                        borderRadius="14px"
                        px={8}
                        h={14}
                        fontWeight="600"
                        _hover={{ bg: 'whiteAlpha.200' }}
                      >
                        Смотреть курсы
                      </Button>
                    </NextLink>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Container>
        </Box>

        {/* Footer */}
        <Box as="footer" bg="white" borderTop="1px solid" borderColor="#EFE8E0" py={8}>
          <Container maxW="1200px">
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <Text color="#6F6F6A" fontSize="14px">
                © {new Date().getFullYear()} {tenant.name}. Все права защищены.
              </Text>
              <HStack gap={6}>
                <NextLink href="/courses">
                  <Text color="#6F6F6A" fontSize="14px" _hover={{ color: primaryColor }}>
                    Курсы
                  </Text>
                </NextLink>
                <NextLink href="/login">
                  <Text color="#6F6F6A" fontSize="14px" _hover={{ color: primaryColor }}>
                    Войти
                  </Text>
                </NextLink>
              </HStack>
            </Flex>
          </Container>
        </Box>
      </Box>
    )
  }

  // Default: show main Kursi platform page
  return (
    <Box minH="100vh">
      {/* Header */}
      <Box as="header" py={4} borderBottom="1px solid" borderColor="cream.200">
        <Container maxW="1140px">
          <Flex justify="space-between" align="center">
            <Heading size="md" color="brand.600">
              Kursi
            </Heading>
            <HStack gap={4}>
              <ChakraLink asChild>
                <NextLink href="/login">
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </NextLink>
              </ChakraLink>
              <ChakraLink asChild>
                <NextLink href="/register">
                  <Button size="sm">
                    Начать бесплатно
                  </Button>
                </NextLink>
              </ChakraLink>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="1140px">
          <VStack gap={8} textAlign="center" maxW="720px" mx="auto">
            <Heading
              as="h1"
              size={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              lineHeight="shorter"
            >
              Создавайте и продавайте
              <Text as="span" color="brand.500"> онлайн курсы </Text>
              легко
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="brown.600" maxW="600px">
              Платформа для учителей и репетиторов. Загружайте видео, собирайте лиды через Telegram-бота,
              принимайте оплату и отслеживайте прогресс студентов.
            </Text>
            <HStack gap={4}>
              <ChakraLink asChild>
                <NextLink href="/register">
                  <Button size="lg">
                    Попробовать бесплатно
                  </Button>
                </NextLink>
              </ChakraLink>
              <ChakraLink asChild>
                <NextLink href="#features">
                  <Button variant="outline" size="lg">
                    Узнать больше
                  </Button>
                </NextLink>
              </ChakraLink>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" py={{ base: 16, md: 24 }} bg="cream.100">
        <Container maxW="1140px">
          <VStack gap={12}>
            <VStack gap={4} textAlign="center">
              <Heading size="lg">Всё что нужно для онлайн обучения</Heading>
              <Text color="brown.600" maxW="600px">
                Простые инструменты для создания курсов и управления студентами
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
              {features.map((feature, index) => (
                <Card.Root key={index} variant="outline" borderColor="cream.200">
                  <Card.Body p={8}>
                    <VStack align="start" gap={4}>
                      <Flex
                        w={12}
                        h={12}
                        bg="brand.50"
                        borderRadius="xl"
                        align="center"
                        justify="center"
                      >
                        <Icon as={feature.icon} boxSize={6} color="brand.500" />
                      </Flex>
                      <Heading size="md">{feature.title}</Heading>
                      <Text color="brown.600">{feature.description}</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="1140px">
          <Card.Root bg="brand.500" color="white">
            <Card.Body py={12} px={8}>
              <VStack gap={6} textAlign="center">
                <Heading size="lg" color="white">
                  Готовы начать?
                </Heading>
                <Text color="whiteAlpha.900" maxW="500px">
                  Создайте свою школу за 5 минут. Без скрытых платежей.
                </Text>
                <ChakraLink asChild>
                  <NextLink href="/register">
                    <Button
                      size="lg"
                      bg="white"
                      color="brand.600"
                      _hover={{ bg: 'cream.100' }}
                    >
                      Создать школу бесплатно
                    </Button>
                  </NextLink>
                </ChakraLink>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" py={8} borderTop="1px solid" borderColor="cream.200">
        <Container maxW="1140px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text color="brown.500" fontSize="sm">
              © 2024 Kursi. Все права защищены.
            </Text>
            <HStack gap={6}>
              <ChakraLink asChild color="brown.500" fontSize="sm" _hover={{ color: 'brand.500' }}>
                <NextLink href="/terms">
                  Условия использования
                </NextLink>
              </ChakraLink>
              <ChakraLink asChild color="brown.500" fontSize="sm" _hover={{ color: 'brand.500' }}>
                <NextLink href="/privacy">
                  Политика конфиденциальности
                </NextLink>
              </ChakraLink>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}
