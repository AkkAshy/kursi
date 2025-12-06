'use client'

import { useEffect, useState, useRef } from 'react'
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
  Textarea,
  Image,
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiPlay,
  FiCheck,
  FiVideo,
  FiDownload,
  FiClipboard,
  FiAlertCircle,
  FiUpload,
  FiX,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '@/lib/api'
import { Lesson, HomeworkSubmission } from '@/types'

interface CourseData {
  id: number
  title: string
  description?: string
  lessons_count: number
  progress_percentage: number
  completed_lessons: number
}

interface LessonProgressMap {
  [lessonId: number]: boolean
}

export default function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)

  const [course, setCourse] = useState<CourseData | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgressMap>({})

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
        const sortedLessons = lessonsData.sort((a, b) => a.order_index - b.order_index)
        setLessons(sortedLessons)

        // Загружаем прогресс по урокам
        const progressMap: LessonProgressMap = {}
        for (const lesson of sortedLessons) {
          try {
            const progress = await api.getLessonProgress(lesson.id)
            progressMap[lesson.id] = progress.is_completed
          } catch {
            progressMap[lesson.id] = false
          }
        }
        setLessonProgress(progressMap)

        // Выбираем первый незавершённый урок или первый урок
        const firstIncomplete = sortedLessons.find(l => !progressMap[l.id])
        if (firstIncomplete) {
          setSelectedLesson(firstIncomplete)
        } else if (sortedLessons.length > 0) {
          setSelectedLesson(sortedLessons[0])
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
                      isCompleted={lessonProgress[lesson.id] || false}
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
              <LessonViewer
                lesson={selectedLesson}
                lessons={lessons}
                isCompleted={lessonProgress[selectedLesson.id] || false}
                onComplete={(lessonId, progressData) => {
                  setLessonProgress(prev => ({ ...prev, [lessonId]: true }))
                  if (progressData) {
                    setCourse(prev => prev ? {
                      ...prev,
                      completed_lessons: progressData.completed_lessons,
                      progress_percentage: progressData.progress_percentage
                    } : null)
                  }
                }}
                onNavigate={(lesson) => setSelectedLesson(lesson)}
              />
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

function LessonViewer({
  lesson,
  lessons,
  isCompleted,
  onComplete,
  onNavigate,
}: {
  lesson: Lesson
  lessons: Lesson[]
  isCompleted: boolean
  onComplete: (lessonId: number, progressData?: { completed_lessons: number; progress_percentage: number }) => void
  onNavigate: (lesson: Lesson) => void
}) {
  const videoUrl = lesson.full_video_url || lesson.video
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Навигация
  const currentIndex = lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  const handleCompleteLesson = async () => {
    if (isCompleted || isCompleting) return

    setIsCompleting(true)
    try {
      const result = await api.completeLesson(lesson.id)
      onComplete(lesson.id, result.course_progress)
    } catch (err) {
      console.error('Error completing lesson:', err)
    } finally {
      setIsCompleting(false)
    }
  }

  // Загружаем предыдущие отправки домашки
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!lesson.homework_required) return

      setIsLoadingSubmissions(true)
      try {
        const data = await api.getHomeworksByLesson(lesson.id)
        setSubmissions(data)
      } catch (err) {
        console.error('Error fetching submissions:', err)
      } finally {
        setIsLoadingSubmissions(false)
      }
    }

    fetchSubmissions()
  }, [lesson.id, lesson.homework_required])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Preview for images
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleSubmit = async () => {
    if (!textAnswer.trim() && !selectedFile) {
      setSubmitError('Добавьте текст или файл')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const newSubmission = await api.submitHomework({
        lesson: lesson.id,
        text_answer: textAnswer || undefined,
        file: selectedFile || undefined,
      })

      setSubmissions([newSubmission, ...submissions])
      setTextAnswer('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowSubmitForm(false)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      console.error('Error submitting homework:', err)
      setSubmitError('Не удалось отправить задание')
    } finally {
      setIsSubmitting(false)
    }
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

  const latestSubmission = submissions[0]
  const canSubmit = !latestSubmission || latestSubmission.status === 'failed'

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

            {/* Homework Section */}
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
                <Box
                  className="homework-markdown"
                  css={{
                    '& p': { marginBottom: '0.75rem', color: '#6F6F6A', fontSize: '15px', lineHeight: '1.6' },
                    '& strong': { color: '#3E3E3C', fontWeight: 600 },
                    '& ul, & ol': { paddingLeft: '1.5rem', marginBottom: '0.75rem', color: '#6F6F6A' },
                    '& li': { marginBottom: '0.25rem', fontSize: '15px' },
                    '& code': {
                      background: '#F5E6D3',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      color: '#8B7355'
                    },
                    '& pre': {
                      background: '#FAF7F2',
                      padding: '1rem',
                      borderRadius: '8px',
                      overflow: 'auto',
                      marginBottom: '0.75rem'
                    },
                    '& pre code': {
                      background: 'transparent',
                      padding: 0,
                      fontSize: '13px'
                    },
                  }}
                  mb={4}
                >
                  <ReactMarkdown>
                    {lesson.homework_description || 'Выполните задание по материалам урока'}
                  </ReactMarkdown>
                </Box>

                {/* Success message */}
                {submitSuccess && (
                  <Box bg="#E8F5EE" color="#4C8F6D" p={4} borderRadius="10px" mb={4}>
                    <HStack gap={2}>
                      <Icon as={FiCheckCircle} />
                      <Text fontSize="14px">Домашнее задание отправлено на проверку!</Text>
                    </HStack>
                  </Box>
                )}

                {/* Previous submissions */}
                {isLoadingSubmissions ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" color="#C98A4A" />
                  </Flex>
                ) : submissions.length > 0 ? (
                  <Box mb={4}>
                    <Text fontSize="13px" fontWeight="600" color="#8B7355" mb={3}>
                      Ваши отправки:
                    </Text>
                    <VStack gap={3} align="stretch">
                      {submissions.map((sub) => (
                        <Box
                          key={sub.id}
                          p={4}
                          bg="white"
                          borderRadius="10px"
                          border="1px solid"
                          borderColor="#EFE8E0"
                        >
                          <Flex justify="space-between" align="start" mb={2}>
                            {getStatusBadge(sub.status)}
                            <Text fontSize="12px" color="#B5A797">
                              {new Date(sub.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </Flex>
                          {sub.text_answer && (
                            <Text fontSize="14px" color="#3E3E3C" mb={2}>
                              {sub.text_answer}
                            </Text>
                          )}
                          {sub.file_url && (
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                              <Text fontSize="13px" color="#4C8F6D" textDecoration="underline">
                                Прикреплённый файл
                              </Text>
                            </a>
                          )}
                          {sub.feedback && (
                            <Box mt={3} p={3} bg="#FAF7F2" borderRadius="8px">
                              <Text fontSize="12px" fontWeight="600" color="#6F6F6A" mb={1}>
                                Комментарий преподавателя:
                              </Text>
                              <Text fontSize="14px" color="#3E3E3C">
                                {sub.feedback}
                              </Text>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ) : null}

                {/* Submit form or button */}
                {canSubmit && (
                  <>
                    {showSubmitForm ? (
                      <Box p={4} bg="white" borderRadius="10px" border="1px solid" borderColor="#EFE8E0">
                        <VStack gap={4} align="stretch">
                          {/* Text answer */}
                          <Box>
                            <Text fontSize="13px" fontWeight="500" color="#3E3E3C" mb={2}>
                              Ваш ответ
                            </Text>
                            <Textarea
                              value={textAnswer}
                              onChange={(e) => setTextAnswer(e.target.value)}
                              placeholder="Напишите ваш ответ..."
                              borderRadius="10px"
                              borderColor="#EFE8E0"
                              _focus={{ borderColor: '#4C8F6D', boxShadow: 'none' }}
                              rows={4}
                            />
                          </Box>

                          {/* File upload */}
                          <Box>
                            <Text fontSize="13px" fontWeight="500" color="#3E3E3C" mb={2}>
                              Прикрепить файл (необязательно)
                            </Text>

                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*,.pdf,.doc,.docx,.txt"
                              style={{ display: 'none' }}
                            />

                            {selectedFile ? (
                              <Flex
                                p={3}
                                bg="#FAF7F2"
                                borderRadius="10px"
                                align="center"
                                justify="space-between"
                              >
                                <HStack gap={2}>
                                  {previewUrl && (
                                    <Image
                                      src={previewUrl}
                                      alt="Preview"
                                      boxSize="40px"
                                      objectFit="cover"
                                      borderRadius="6px"
                                    />
                                  )}
                                  <Text fontSize="13px" color="#3E3E3C">
                                    {selectedFile.name}
                                  </Text>
                                </HStack>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedFile(null)
                                    setPreviewUrl(null)
                                  }}
                                >
                                  <Icon as={FiX} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex
                                p={4}
                                border="2px dashed #C9BDB0"
                                borderRadius="10px"
                                align="center"
                                justify="center"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ borderColor: '#4C8F6D', bg: '#FAF7F2' }}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <HStack gap={2}>
                                  <Icon as={FiUpload} color="#6F6F6A" />
                                  <Text fontSize="13px" color="#6F6F6A">
                                    Выберите файл
                                  </Text>
                                </HStack>
                              </Flex>
                            )}
                          </Box>

                          {/* Error */}
                          {submitError && (
                            <Text fontSize="13px" color="#DC2626">
                              {submitError}
                            </Text>
                          )}

                          {/* Actions */}
                          <HStack gap={3}>
                            <Button
                              bg="#4C8F6D"
                              color="white"
                              borderRadius="10px"
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              _hover={{ opacity: 0.9 }}
                            >
                              {isSubmitting ? <Spinner size="sm" /> : 'Отправить'}
                            </Button>
                            <Button
                              variant="ghost"
                              color="#6F6F6A"
                              borderRadius="10px"
                              onClick={() => {
                                setShowSubmitForm(false)
                                setTextAnswer('')
                                setSelectedFile(null)
                                setPreviewUrl(null)
                                setSubmitError(null)
                              }}
                            >
                              Отмена
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    ) : (
                      <Button
                        bg="#C98A4A"
                        color="white"
                        borderRadius="10px"
                        onClick={() => setShowSubmitForm(true)}
                        _hover={{ opacity: 0.9 }}
                      >
                        {latestSubmission?.status === 'failed'
                          ? 'Отправить заново'
                          : 'Отправить домашнее задание'}
                      </Button>
                    )}
                  </>
                )}

                {/* Already passed */}
                {latestSubmission?.status === 'passed' && (
                  <Box bg="#E8F5EE" p={4} borderRadius="10px">
                    <HStack gap={2}>
                      <Icon as={FiCheckCircle} color="#4C8F6D" />
                      <Text fontSize="14px" color="#4C8F6D" fontWeight="500">
                        Домашнее задание выполнено!
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>
            )}

            {/* Complete Lesson Button */}
            <Box pt={4} borderTop="1px solid" borderColor="#EFE8E0">
              {isCompleted ? (
                <Flex
                  p={4}
                  bg="#E8F5EE"
                  borderRadius="12px"
                  align="center"
                  justify="center"
                  gap={2}
                >
                  <Icon as={FiCheckCircle} color="#4C8F6D" boxSize={5} />
                  <Text fontSize="15px" color="#4C8F6D" fontWeight="600">
                    Урок завершён
                  </Text>
                </Flex>
              ) : (
                <Button
                  w="full"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  h={12}
                  fontSize="15px"
                  fontWeight="600"
                  onClick={handleCompleteLesson}
                  disabled={isCompleting}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  {isCompleting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Icon as={FiCheck} mr={2} />
                      Отметить урок как завершённый
                    </>
                  )}
                </Button>
              )}
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Navigation */}
      <Flex justify="space-between" gap={4}>
        {prevLesson ? (
          <Button
            flex={1}
            variant="outline"
            borderColor="#EFE8E0"
            color="#6F6F6A"
            borderRadius="12px"
            h={12}
            onClick={() => onNavigate(prevLesson)}
            _hover={{ borderColor: '#4C8F6D', color: '#4C8F6D' }}
          >
            <Icon as={FiChevronLeft} mr={2} />
            {prevLesson.title.length > 25 ? prevLesson.title.slice(0, 25) + '...' : prevLesson.title}
          </Button>
        ) : (
          <Box flex={1} />
        )}

        {nextLesson ? (
          <Button
            flex={1}
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            h={12}
            onClick={() => onNavigate(nextLesson)}
            _hover={{ bg: '#3F7A5C' }}
          >
            {nextLesson.title.length > 25 ? nextLesson.title.slice(0, 25) + '...' : nextLesson.title}
            <Icon as={FiChevronRight} ml={2} />
          </Button>
        ) : (
          <Box flex={1} />
        )}
      </Flex>
    </VStack>
  )
}
