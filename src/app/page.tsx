'use client'

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
} from '@chakra-ui/react'
import { FiBook, FiUsers, FiTrendingUp, FiMessageCircle } from 'react-icons/fi'
import NextLink from 'next/link'

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
