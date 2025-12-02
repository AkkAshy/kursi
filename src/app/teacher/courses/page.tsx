'use client'

import { useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
  Button,
  Card,
  Badge,
  Spinner,
} from '@chakra-ui/react'
import {
  FiPlus,
  FiUsers,
  FiBook,
  FiEdit2,
  FiEye,
  FiAlertCircle,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { useCoursesStore } from '@/stores/coursesStore'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
}

export default function TeacherCoursesPage() {
  const { courses, isLoading, error, fetchMyCourses } = useCoursesStore()

  useEffect(() => {
    fetchMyCourses()
  }, [fetchMyCourses])

  return (
    <Box maxW="1120px">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading
            as="h1"
            fontSize="28px"
            fontWeight="bold"
            color="#3E3E3C"
            letterSpacing="-0.5px"
            mb={2}
          >
            Мои курсы
          </Heading>
          <Text color="#6F6F6A" fontSize="15px">
            Управляйте своими курсами и добавляйте новые материалы
          </Text>
        </Box>

        <NextLink href="/teacher/courses/new">
          <Button
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            px={6}
            py={5}
            fontWeight="600"
            fontSize="14px"
            boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
            transition="all 0.2s ease-out"
            _hover={{
              bg: '#3F7A5C',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px -2px rgba(76, 143, 109, 0.4)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
          >
            <Icon as={FiPlus} mr={2} />
            Создать курс
          </Button>
        </NextLink>
      </Flex>

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" minH="300px">
          <VStack gap={4}>
            <Spinner size="xl" color="#4C8F6D" />
            <Text color="#6F6F6A">Загрузка курсов...</Text>
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

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="400px"
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
            <Icon as={FiBook} boxSize={10} color="#4C8F6D" />
          </Flex>
          <Heading as="h3" fontSize="20px" color="#3E3E3C" mb={2}>
            Нет курсов
          </Heading>
          <Text color="#6F6F6A" fontSize="15px" mb={6} textAlign="center" maxW="300px">
            Создайте свой первый курс и начните привлекать студентов
          </Text>
          <NextLink href="/teacher/courses/new">
            <Button
              bg="#4C8F6D"
              color="white"
              borderRadius="12px"
              px={6}
              py={5}
              fontWeight="600"
              _hover={{ bg: '#3F7A5C' }}
            >
              <Icon as={FiPlus} mr={2} />
              Создать первый курс
            </Button>
          </NextLink>
        </Flex>
      )}

      {/* Courses Grid */}
      {!isLoading && courses.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {courses.map((course) => (
            <Card.Root
              key={course.id}
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              overflow="hidden"
              position="relative"
              transition="all 0.25s ease-out"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px -8px rgba(0,0,0,0.15)',
              }}
            >
              {/* Accent bar */}
              <Box
                position="absolute"
                left={0}
                top={0}
                bottom={0}
                w="4px"
                bg={course.is_published ? '#4C8F6D' : '#C98A4A'}
              />

              {/* Cover Image Placeholder */}
              <Box
                h="140px"
                bg={course.is_published
                  ? 'linear-gradient(135deg, #E8F5EE 0%, #DDE8DD 100%)'
                  : 'linear-gradient(135deg, #FDF6ED 0%, #F9E8D3 100%)'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  as={FiBook}
                  boxSize={12}
                  color={course.is_published ? '#4C8F6D' : '#C98A4A'}
                  opacity={0.5}
                />
              </Box>

              <Card.Body p={6}>
                {/* Status Badge */}
                <Badge
                  mb={3}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="11px"
                  fontWeight="600"
                  bg={course.is_published ? '#E8F5EE' : '#FDF6ED'}
                  color={course.is_published ? '#4C8F6D' : '#C98A4A'}
                >
                  {course.is_published ? 'Опубликован' : 'Черновик'}
                </Badge>

                {/* Title */}
                <Heading
                  as="h3"
                  fontSize="18px"
                  fontWeight="bold"
                  color="#3E3E3C"
                  mb={2}
                  lineHeight="1.3"
                  lineClamp={2}
                >
                  {course.title}
                </Heading>

                {/* Description */}
                <Text
                  fontSize="14px"
                  color="#6F6F6A"
                  mb={4}
                  lineHeight="1.5"
                  lineClamp={2}
                >
                  {course.description || 'Описание не добавлено'}
                </Text>

                {/* Stats */}
                <HStack gap={4} mb={4}>
                  <HStack gap={1}>
                    <Icon as={FiUsers} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" color="#6F6F6A">
                      {course.students_count} студентов
                    </Text>
                  </HStack>
                  <HStack gap={1}>
                    <Icon as={FiBook} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" color="#6F6F6A">
                      {course.lessons_count} уроков
                    </Text>
                  </HStack>
                </HStack>

                {/* Price */}
                <Text
                  fontSize="16px"
                  fontWeight="bold"
                  color="#3E3E3C"
                  mb={4}
                >
                  {formatPrice(course.price)}
                </Text>

                {/* Actions */}
                <HStack gap={2}>
                  <NextLink href={`/teacher/courses/${course.id}`} style={{ flex: 1 }}>
                    <Button
                      w="full"
                      variant="outline"
                      borderColor="#EFE8E0"
                      color="#3E3E3C"
                      borderRadius="10px"
                      fontSize="13px"
                      fontWeight="600"
                      _hover={{
                        bg: '#FAF7F2',
                        borderColor: '#4C8F6D',
                        color: '#4C8F6D',
                      }}
                    >
                      <Icon as={FiEdit2} mr={2} boxSize={4} />
                      Редактировать
                    </Button>
                  </NextLink>
                  <Button
                    variant="ghost"
                    borderRadius="10px"
                    px={3}
                    color="#6F6F6A"
                    _hover={{
                      bg: '#FAF7F2',
                      color: '#3E3E3C',
                    }}
                  >
                    <Icon as={FiEye} boxSize={4} />
                  </Button>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}

          {/* Add New Course Card */}
          <NextLink href="/teacher/courses/new">
            <Card.Root
              bg="transparent"
              borderRadius="16px"
              border="2px dashed"
              borderColor="#DDE8DD"
              minH="400px"
              cursor="pointer"
              transition="all 0.2s ease-out"
              _hover={{
                borderColor: '#4C8F6D',
                bg: '#E8F5EE',
              }}
            >
              <Card.Body
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={4}
              >
                <Flex
                  w={16}
                  h={16}
                  bg="white"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  boxShadow="0 4px 12px -2px rgba(76, 143, 109, 0.2)"
                >
                  <Icon as={FiPlus} boxSize={8} color="#4C8F6D" />
                </Flex>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="#4C8F6D"
                >
                  Создать новый курс
                </Text>
                <Text
                  fontSize="14px"
                  color="#6F6F6A"
                  textAlign="center"
                  maxW="200px"
                >
                  Добавьте видео, текст и структурируйте обучение
                </Text>
              </Card.Body>
            </Card.Root>
          </NextLink>
        </SimpleGrid>
      )}
    </Box>
  )
}
