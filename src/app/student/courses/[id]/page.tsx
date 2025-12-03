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
  Button,
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiPlay,
  FiCheck,
  FiLock,
  FiVideo,
  FiFileText,
  FiDownload,
  FiClipboard,
  FiAlertCircle,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { use } from 'react'
import api from '@/lib/api'
import { Lesson } from '@/types'

interface CourseData {
  id: number
  title: string
  description?: string
  lessons_count: number
  progress_percentage: number
  completed_lessons: number
}

export default function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)

  const [course, setCourse] = useState<CourseData | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        if (!api.isAuthenticated()) {
          window.location.href = '/login?redirect=/student'
          return
        }

        // Получаем курсы студента чтобы проверить доступ
        const coursesData = await api.getStudentCourses()
        const courseData = coursesData.find(c => c.id === courseId)

        if (!courseData) {
          setError('У вас нет доступа к этому курсу')
          return
        }

        setCourse({
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          lessons_count: courseData.lessons_count,
          progress_percentage: courseData.progress_percentage,
          completed_lessons: courseData.completed_lessons,
        })

        // Получаем уроки
        const lessonsData = await api.getLessons(courseId)
        setLessons(lessonsData.sort((a, b) => a.order_index - b.order_index))

        // Выбираем первый урок по умолчанию
        if (lessonsData.length > 0) {
          setSelectedLesson(lessonsData[0])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Не удалось загрузить курс')
      } finally {
        setIsLoading(false)
      }
    }

    if (!isNaN(courseId)) {
      fetchData()
    }
  }, [courseId])

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
        <Heading size="lg" color="#3E3E3C">{error || 'Курс не найден'}</Heading>
        <NextLink href="/student">
          <Button
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            _hover={{ bg: '#3F7A5C' }}
          >
            Назад к курсам
          </Button>
        </NextLink>
      </Flex>
    )
  }

  return (
    <Box minH="100vh" bg="#FAF7F2">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="#EFE8E0" py={4}>
        <Box maxW="1400px" mx="auto" px={6}>
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <NextLink href="/student">
                <Flex
                  w={10}
                  h={10}
                  bg="#FDFBF8"
                  borderRadius="12px"
                  align="center"
                  justify="center"
                  cursor="pointer"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  transition="all 0.15s"
                  _hover={{ borderColor: '#4C8F6D', color: '#4C8F6D' }}
                >
                  <Icon as={FiArrowLeft} boxSize={5} />
                </Flex>
              </NextLink>
              <Box>
                <Heading size="md" color="#3E3E3C">
                  {course.title}
                </Heading>
                <HStack gap={3} mt={1}>
                  <Text fontSize="13px" color="#6F6F6A">
                    {course.completed_lessons} из {course.lessons_count} уроков
                  </Text>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    fontSize="11px"
                    bg="#E8F5EE"
                    color="#4C8F6D"
                  >
                    {course.progress_percentage}%
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            {/* Progress bar */}
            <Box w="200px">
              <Progress.Root value={course.progress_percentage} size="sm" borderRadius="full">
                <Progress.Track bg="#E8F5EE" borderRadius="full">
                  <Progress.Range bg="#4C8F6D" borderRadius="full" />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="1400px" mx="auto" px={6} py={6}>
        <Flex gap={6}>
          {/* Sidebar - Lesson List */}
          <Box w="320px" flexShrink={0}>
            <Card.Root
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              position="sticky"
              top="24px"
            >
              <Card.Header p={5} pb={3}>
                <Heading size="sm" color="#3E3E3C">
                  Уроки курса
                </Heading>
              </Card.Header>
              <Card.Body p={3} pt={0} maxH="calc(100vh - 200px)" overflow="auto">
                <VStack gap={1} align="stretch">
                  {lessons.map((lesson, index) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      index={index + 1}
                      isSelected={selectedLesson?.id === lesson.id}
                      isCompleted={index < course.completed_lessons}
                      onClick={() => setSelectedLesson(lesson)}
                    />
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Main Content - Lesson Viewer */}
          <Box flex={1}>
            {selectedLesson ? (
              <LessonViewer lesson={selectedLesson} />
            ) : (
              <Card.Root
                bg="white"
                borderRadius="16px"
                boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
                border="1px solid"
                borderColor="#EFE8E0"
              >
                <Card.Body p={12}>
                  <VStack gap={4}>
                    <Icon as={FiPlay} boxSize={16} color="#4C8F6D" opacity={0.5} />
                    <Text color="#6F6F6A">Выберите урок для просмотра</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

function LessonItem({
  lesson,
  index,
  isSelected,
  isCompleted,
  onClick,
}: {
  lesson: Lesson
  index: number
  isSelected: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  const hasVideo = lesson.video || lesson.full_video_url || lesson.has_video

  return (
    <Flex
      align="center"
      gap={3}
      p={3}
      bg={isSelected ? '#E8F5EE' : 'transparent'}
      borderRadius="12px"
      cursor="pointer"
      transition="all 0.15s"
      onClick={onClick}
      _hover={{
        bg: isSelected ? '#E8F5EE' : '#FDFBF8',
      }}
    >
      <Flex
        w={8}
        h={8}
        bg={isCompleted ? '#4C8F6D' : isSelected ? '#4C8F6D' : '#FDFBF8'}
        borderRadius="8px"
        align="center"
        justify="center"
        border={!isCompleted && !isSelected ? '1px solid' : 'none'}
        borderColor="#EFE8E0"
      >
        {isCompleted ? (
          <Icon as={FiCheck} boxSize={4} color="white" />
        ) : (
          <Text
            fontSize="12px"
            fontWeight="600"
            color={isSelected ? 'white' : '#6F6F6A'}
          >
            {index}
          </Text>
        )}
      </Flex>

      <Box flex={1}>
        <Text
          fontSize="14px"
          fontWeight={isSelected ? '600' : '500'}
          color={isSelected ? '#3E3E3C' : '#6F6F6A'}
          lineClamp={1}
        >
          {lesson.title}
        </Text>
        <HStack gap={2} mt={0.5}>
          {hasVideo && (
            <Icon as={FiVideo} boxSize={3} color="#4C8F6D" />
          )}
          {lesson.homework_required && (
            <Icon as={FiClipboard} boxSize={3} color="#C98A4A" />
          )}
        </HStack>
      </Box>
    </Flex>
  )
}

function LessonViewer({ lesson }: { lesson: Lesson }) {
  const videoUrl = lesson.full_video_url || lesson.video

  return (
    <VStack gap={6} align="stretch">
      {/* Video Player */}
      {videoUrl && (
        <Card.Root
          bg="black"
          borderRadius="16px"
          overflow="hidden"
          boxShadow="0 4px 16px -4px rgba(0,0,0,0.2)"
        >
          <Box position="relative" paddingTop="56.25%">
            <video
              src={videoUrl}
              controls
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        </Card.Root>
      )}

      {/* Lesson Content */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Body p={8}>
          <VStack align="stretch" gap={6}>
            <Box>
              <Heading size="lg" color="#3E3E3C" mb={2}>
                {lesson.title}
              </Heading>
              {lesson.description && (
                <Text fontSize="16px" color="#6F6F6A">
                  {lesson.description}
                </Text>
              )}
            </Box>

            {lesson.text_content && (
              <Box>
                <Text
                  fontSize="15px"
                  color="#3E3E3C"
                  lineHeight="1.8"
                  whiteSpace="pre-wrap"
                >
                  {lesson.text_content}
                </Text>
              </Box>
            )}

            {/* Materials */}
            {lesson.materials && lesson.materials.length > 0 && (
              <Box>
                <Heading size="sm" color="#3E3E3C" mb={4}>
                  Материалы для скачивания
                </Heading>
                <VStack gap={2} align="stretch">
                  {lesson.materials.map((material) => (
                    <a
                      key={material.id}
                      href={material.file}
                      target="_blank"
                      download
                      style={{ textDecoration: 'none' }}
                    >
                      <Flex
                        p={4}
                        bg="#FDFBF8"
                        borderRadius="12px"
                        align="center"
                        gap={3}
                        _hover={{ bg: '#E8F5EE' }}
                        transition="all 0.15s"
                        cursor="pointer"
                      >
                        <Icon as={FiDownload} boxSize={5} color="#4C8F6D" />
                        <Text fontSize="14px" color="#3E3E3C" flex={1}>
                          {material.title}
                        </Text>
                      </Flex>
                    </a>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Homework */}
            {lesson.homework_required && (
              <Box
                p={6}
                bg="#FDF6ED"
                borderRadius="14px"
                border="1px solid"
                borderColor="#F5E6D3"
              >
                <HStack gap={3} mb={3}>
                  <Icon as={FiClipboard} boxSize={5} color="#C98A4A" />
                  <Heading size="sm" color="#3E3E3C">
                    Домашнее задание
                  </Heading>
                </HStack>
                <Text fontSize="15px" color="#6F6F6A" whiteSpace="pre-wrap">
                  {lesson.homework_description || 'Выполните задание по материалам урока'}
                </Text>
              </Box>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
