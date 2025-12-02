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
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Spinner,
  Checkbox,
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiTrash2,
  FiPlus,
  FiVideo,
  FiFileText,
  FiMoreVertical,
  FiEdit2,
  FiUsers,
  FiDollarSign,
  FiAlertCircle,
  FiUpload,
  FiX,
  FiFile,
  FiDownload,
  FiClipboard,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { use } from 'react'
import { useCoursesStore } from '@/stores/coursesStore'
import { useLessonsStore } from '@/stores/lessonsStore'
import { Lesson } from '@/types'

// Модалка создания/редактирования урока
function LessonModal({
  isOpen,
  onClose,
  courseId,
  nextOrder,
  lesson,
}: {
  isOpen: boolean
  onClose: () => void
  courseId: number
  nextOrder: number
  lesson?: Lesson | null
}) {
  const { createLesson, updateLesson, uploadMaterial, deleteMaterial, isLoading } = useLessonsStore()
  const videoInputRef = useRef<HTMLInputElement>(null)
  const materialInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [textContent, setTextContent] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [homeworkRequired, setHomeworkRequired] = useState(false)
  const [homeworkDescription, setHomeworkDescription] = useState('')
  const [pendingMaterials, setPendingMaterials] = useState<File[]>([])

  const isEdit = !!lesson

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setTextContent(lesson.text_content || '')
      setHomeworkRequired(lesson.homework_required || false)
      setHomeworkDescription(lesson.homework_description || '')
      setVideo(null)
      setPendingMaterials([])
    } else {
      setTitle('')
      setDescription('')
      setTextContent('')
      setVideo(null)
      setHomeworkRequired(false)
      setHomeworkDescription('')
      setPendingMaterials([])
    }
  }, [lesson, isOpen])

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Пожалуйста, выберите видео файл')
        return
      }
      if (file.size > 500 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 500MB')
        return
      }
      setVideo(file)
    }
  }

  const handleMaterialSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        if (file.size > 50 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой. Максимальный размер: 50MB`)
          return false
        }
        return true
      })
      setPendingMaterials(prev => [...prev, ...newFiles])
    }
  }

  const handleRemovePendingMaterial = (index: number) => {
    setPendingMaterials(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    try {
      if (isEdit && lesson) {
        await updateLesson(lesson.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          text_content: textContent.trim() || undefined,
          video: video || undefined,
          homework_required: homeworkRequired,
          homework_description: homeworkDescription.trim() || undefined,
        })
        // Upload pending materials
        for (const file of pendingMaterials) {
          await uploadMaterial(lesson.id, file)
        }
      } else {
        const newLesson = await createLesson({
          course: courseId,
          title: title.trim(),
          order_index: nextOrder,
          description: description.trim() || undefined,
          text_content: textContent.trim() || undefined,
          video: video || undefined,
          homework_required: homeworkRequired,
          homework_description: homeworkDescription.trim() || undefined,
        })
        // Upload pending materials
        for (const file of pendingMaterials) {
          await uploadMaterial(newLesson.id, file)
        }
      }
      onClose()
    } catch {
      // Ошибка обрабатывается в store
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0,0,0,0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Card.Root
        bg="white"
        borderRadius="20px"
        w="600px"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card.Header p={6} pb={4}>
          <Heading size="md" color="#3E3E3C">
            {isEdit ? 'Редактировать урок' : 'Добавить урок'}
          </Heading>
        </Card.Header>
        <Card.Body p={6} pt={0}>
          <VStack gap={5} align="stretch">
            {/* Название урока */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Название урока *
              </Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введение в курс"
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                fontSize="15px"
                py={5}
                _focus={{
                  borderColor: '#4C8F6D',
                  boxShadow: '0 0 0 1px #4C8F6D',
                }}
              />
            </Box>

            {/* Описание */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Описание урока
              </Text>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание того, что будет в уроке"
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                fontSize="15px"
                rows={2}
                resize="none"
                _focus={{
                  borderColor: '#4C8F6D',
                  boxShadow: '0 0 0 1px #4C8F6D',
                }}
              />
            </Box>

            {/* Видео урока */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Видео урока
              </Text>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                style={{ display: 'none' }}
              />

              {video ? (
                <Flex
                  p={4}
                  bg="#E8F5EE"
                  borderRadius="12px"
                  align="center"
                  gap={3}
                >
                  <Flex
                    w={10}
                    h={10}
                    bg="#4C8F6D"
                    borderRadius="10px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiVideo} boxSize={5} color="white" />
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="14px" fontWeight="600" color="#3E3E3C" lineClamp={1}>
                      {video.name}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      {formatFileSize(video.size)}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#C98A4A"
                    borderRadius="8px"
                    onClick={() => setVideo(null)}
                    _hover={{ bg: '#FDF6ED' }}
                  >
                    <Icon as={FiX} boxSize={4} />
                  </Button>
                </Flex>
              ) : lesson?.video ? (
                <Flex
                  p={4}
                  bg="#E8F5EE"
                  borderRadius="12px"
                  align="center"
                  gap={3}
                >
                  <Flex
                    w={10}
                    h={10}
                    bg="#4C8F6D"
                    borderRadius="10px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiVideo} boxSize={5} color="white" />
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
                      Видео загружено
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      Нажмите чтобы заменить
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="8px"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Заменить
                  </Button>
                </Flex>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  p={6}
                  bg="#FDFBF8"
                  border="2px dashed"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: '#4C8F6D',
                    bg: '#E8F5EE',
                  }}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Icon as={FiUpload} boxSize={6} color="#4C8F6D" mb={2} />
                  <Text fontSize="14px" fontWeight="600" color="#3E3E3C" mb={1}>
                    Загрузить видео
                  </Text>
                  <Text fontSize="12px" color="#6F6F6A">
                    MP4, MOV, AVI до 500MB
                  </Text>
                </Flex>
              )}
            </Box>

            {/* Текстовый контент */}
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Текстовый контент
              </Text>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Дополнительный текстовый материал урока..."
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                fontSize="15px"
                rows={4}
                resize="none"
                _focus={{
                  borderColor: '#4C8F6D',
                  boxShadow: '0 0 0 1px #4C8F6D',
                }}
              />
            </Box>

            {/* Материалы */}
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="13px" fontWeight="600" color="#6F6F6A">
                  Материалы для скачивания
                </Text>
                <input
                  ref={materialInputRef}
                  type="file"
                  multiple
                  onChange={handleMaterialSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  size="xs"
                  variant="ghost"
                  color="#4C8F6D"
                  onClick={() => materialInputRef.current?.click()}
                >
                  <Icon as={FiPlus} mr={1} />
                  Добавить
                </Button>
              </Flex>

              <VStack gap={2} align="stretch">
                {/* Existing materials (for edit mode) */}
                {lesson?.materials?.map((material) => (
                  <Flex
                    key={material.id}
                    p={3}
                    bg="#FDFBF8"
                    borderRadius="10px"
                    align="center"
                    gap={3}
                  >
                    <Icon as={FiFile} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="13px" color="#3E3E3C" flex={1} lineClamp={1}>
                      {material.title}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="#C98A4A"
                      onClick={() => lesson && deleteMaterial(lesson.id, material.id)}
                    >
                      <Icon as={FiTrash2} boxSize={3} />
                    </Button>
                  </Flex>
                ))}

                {/* Pending materials */}
                {pendingMaterials.map((file, index) => (
                  <Flex
                    key={`pending-${index}`}
                    p={3}
                    bg="#E8F5EE"
                    borderRadius="10px"
                    align="center"
                    gap={3}
                  >
                    <Icon as={FiFile} boxSize={4} color="#4C8F6D" />
                    <Box flex={1}>
                      <Text fontSize="13px" color="#3E3E3C" lineClamp={1}>
                        {file.name}
                      </Text>
                      <Text fontSize="11px" color="#6F6F6A">
                        {formatFileSize(file.size)} • Ожидает загрузки
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="#C98A4A"
                      onClick={() => handleRemovePendingMaterial(index)}
                    >
                      <Icon as={FiX} boxSize={3} />
                    </Button>
                  </Flex>
                ))}

                {(!lesson?.materials?.length && !pendingMaterials.length) && (
                  <Text fontSize="13px" color="#B5A797" textAlign="center" py={2}>
                    Нет прикрепленных материалов
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Домашнее задание */}
            <Box>
              <Flex align="center" gap={3} mb={3}>
                <Checkbox.Root
                  checked={homeworkRequired}
                  onCheckedChange={(e) => setHomeworkRequired(!!e.checked)}
                  colorPalette="green"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderRadius="6px"
                    borderColor="#EFE8E0"
                    _checked={{ bg: '#4C8F6D', borderColor: '#4C8F6D' }}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>
                    <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
                      Требуется домашнее задание
                    </Text>
                  </Checkbox.Label>
                </Checkbox.Root>
              </Flex>

              {homeworkRequired && (
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Описание домашнего задания
                  </Text>
                  <Textarea
                    value={homeworkDescription}
                    onChange={(e) => setHomeworkDescription(e.target.value)}
                    placeholder="Опишите, что нужно сделать студенту..."
                    bg="#FDFBF8"
                    border="1px solid"
                    borderColor="#EFE8E0"
                    borderRadius="12px"
                    fontSize="15px"
                    rows={3}
                    resize="none"
                    _focus={{
                      borderColor: '#4C8F6D',
                      boxShadow: '0 0 0 1px #4C8F6D',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Кнопки */}
            <HStack gap={3} pt={2}>
              <Button
                flex={1}
                variant="outline"
                borderColor="#EFE8E0"
                color="#6F6F6A"
                borderRadius="12px"
                onClick={onClose}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                flex={1}
                bg="#4C8F6D"
                color="white"
                borderRadius="12px"
                onClick={handleSubmit}
                disabled={!title.trim() || isLoading}
                _hover={{ bg: '#3F7A5C' }}
              >
                {isLoading ? <Spinner size="sm" /> : isEdit ? 'Сохранить' : 'Добавить'}
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id)

  const { courses, fetchMyCourses, isLoading: coursesLoading } = useCoursesStore()
  const { lessons, fetchLessons, deleteLesson, isLoading: lessonsLoading } = useLessonsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [mounted, setMounted] = useState(false)

  const course = courses.find((c) => c.id === courseId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchMyCourses()
      if (!isNaN(courseId)) {
        fetchLessons(courseId)
      }
    }
  }, [mounted, courseId, fetchMyCourses, fetchLessons])

  const handleDeleteLesson = async (lessonId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот урок?')) {
      await deleteLesson(lessonId)
    }
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
  }

  const isLoading = coursesLoading || lessonsLoading

  if (!mounted) {
    return (
      <Flex minH="400px" align="center" justify="center">
        <Spinner size="xl" color="#4C8F6D" />
      </Flex>
    )
  }

  if (coursesLoading || !courses.length) {
    return (
      <Flex minH="400px" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="xl" color="#4C8F6D" />
          <Text color="#6F6F6A">Загрузка курса...</Text>
        </VStack>
      </Flex>
    )
  }

  if (!course) {
    return (
      <Flex minH="400px" align="center" justify="center" direction="column" gap={4}>
        <Icon as={FiAlertCircle} boxSize={12} color="#C98A4A" />
        <Text color="#6F6F6A">Курс не найден</Text>
        <NextLink href="/teacher/courses">
          <Button variant="outline" borderRadius="12px">
            Вернуться к курсам
          </Button>
        </NextLink>
      </Flex>
    )
  }

  return (
    <Box maxW="1120px">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <HStack gap={4}>
          <NextLink href="/teacher/courses">
            <Flex
              w={10}
              h={10}
              bg="white"
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
            <Heading
              as="h1"
              fontSize="24px"
              fontWeight="bold"
              color="#3E3E3C"
              letterSpacing="-0.3px"
            >
              {course.title}
            </Heading>
            <HStack gap={2} mt={1}>
              <Badge
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
              <Text fontSize="13px" color="#6F6F6A">
                ID: {id}
              </Text>
            </HStack>
          </Box>
        </HStack>

        <HStack gap={3}>
          <Button
            variant="outline"
            borderColor="#EFE8E0"
            color="#6F6F6A"
            borderRadius="12px"
            fontSize="14px"
            fontWeight="600"
            _hover={{ borderColor: '#3E3E3C', color: '#3E3E3C' }}
          >
            <Icon as={FiEye} mr={2} />
            Предпросмотр
          </Button>
          <Button
            bg="#4C8F6D"
            color="white"
            borderRadius="12px"
            fontSize="14px"
            fontWeight="600"
            boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
            _hover={{ bg: '#3F7A5C' }}
          >
            <Icon as={FiSave} mr={2} />
            Сохранить
          </Button>
        </HStack>
      </Flex>

      <Flex gap={6}>
        {/* Main Content */}
        <Box flex={1}>
          {/* Course Info Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
            mb={6}
          >
            <Card.Body p={6}>
              <VStack gap={5} align="stretch">
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Название курса
                  </Text>
                  <Input
                    defaultValue={course.title}
                    bg="#FDFBF8"
                    border="1px solid"
                    borderColor="#EFE8E0"
                    borderRadius="12px"
                    fontSize="15px"
                    py={5}
                    _focus={{
                      borderColor: '#4C8F6D',
                      boxShadow: '0 0 0 1px #4C8F6D',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Описание
                  </Text>
                  <Textarea
                    defaultValue={course.description || ''}
                    bg="#FDFBF8"
                    border="1px solid"
                    borderColor="#EFE8E0"
                    borderRadius="12px"
                    fontSize="15px"
                    rows={4}
                    resize="none"
                    _focus={{
                      borderColor: '#4C8F6D',
                      boxShadow: '0 0 0 1px #4C8F6D',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                    Цена (сум)
                  </Text>
                  <Input
                    type="number"
                    defaultValue={course.price}
                    bg="#FDFBF8"
                    border="1px solid"
                    borderColor="#EFE8E0"
                    borderRadius="12px"
                    fontSize="15px"
                    py={5}
                    w="200px"
                    _focus={{
                      borderColor: '#4C8F6D',
                      boxShadow: '0 0 0 1px #4C8F6D',
                    }}
                  />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Lessons Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Header p={6} pb={4}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="sm" color="#3E3E3C">
                    Уроки курса
                  </Heading>
                  <Text fontSize="13px" color="#6F6F6A" mt={1}>
                    {lessons.length} {lessons.length === 1 ? 'урок' : lessons.length < 5 ? 'урока' : 'уроков'}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="10px"
                  fontSize="13px"
                  _hover={{ bg: '#3F7A5C' }}
                  onClick={() => {
                    setEditingLesson(null)
                    setIsModalOpen(true)
                  }}
                >
                  <Icon as={FiPlus} mr={2} />
                  Добавить урок
                </Button>
              </Flex>
            </Card.Header>
            <Card.Body p={6} pt={0}>
              {lessonsLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" color="#4C8F6D" />
                </Flex>
              ) : lessons.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={12}
                  color="#6F6F6A"
                >
                  <Icon as={FiVideo} boxSize={10} mb={3} opacity={0.5} />
                  <Text fontSize="15px" mb={2}>Пока нет уроков</Text>
                  <Text fontSize="13px" color="#B5A797">
                    Добавьте первый урок, чтобы начать
                  </Text>
                </Flex>
              ) : (
                <VStack gap={3} align="stretch">
                  {lessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={() => handleEditLesson(lesson)}
                      onDelete={() => handleDeleteLesson(lesson.id)}
                    />
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </Box>

        {/* Sidebar */}
        <Box w="300px">
          {/* Stats Card */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
            mb={6}
          >
            <Card.Body p={6}>
              <Heading size="sm" color="#3E3E3C" mb={4}>
                Статистика
              </Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <Icon as={FiUsers} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="14px" color="#6F6F6A">Студентов</Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
                    {course.students_count || 0}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <Icon as={FiDollarSign} boxSize={4} color="#6F6F6A" />
                    <Text fontSize="14px" color="#6F6F6A">Доход</Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="#4C8F6D">
                    {((course.total_revenue || 0) / 1000000).toFixed(1)}M сум
                  </Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Danger Zone */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Body p={6}>
              <Button
                w="full"
                variant="outline"
                borderColor="#EFE8E0"
                color="#C98A4A"
                borderRadius="10px"
                fontSize="13px"
                _hover={{ bg: '#FDF6ED', borderColor: '#C98A4A' }}
              >
                <Icon as={FiTrash2} mr={2} />
                Удалить курс
              </Button>
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>

      {/* Modal */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseId={courseId}
        nextOrder={lessons.length + 1}
        lesson={editingLesson}
      />
    </Box>
  )
}

// Компонент отдельного урока
function LessonItem({ lesson, onEdit, onDelete }: { lesson: Lesson; onEdit: () => void; onDelete: () => void }) {
  const hasVideo = lesson.video || lesson.full_video_url || lesson.has_video
  const materialsCount = lesson.materials_count ?? lesson.materials?.length ?? 0

  return (
    <Flex
      align="center"
      gap={4}
      p={4}
      bg="#FDFBF8"
      borderRadius="14px"
      border="1px solid"
      borderColor="transparent"
      transition="all 0.15s"
      _hover={{
        bg: '#FAF7F2',
        borderColor: '#EFE8E0',
      }}
    >
      <Icon as={FiMoreVertical} boxSize={5} color="#C9BDB0" cursor="grab" />

      <Flex
        w={10}
        h={10}
        bg={hasVideo ? '#E8F5EE' : '#FDF6ED'}
        borderRadius="10px"
        align="center"
        justify="center"
      >
        <Icon
          as={hasVideo ? FiVideo : FiFileText}
          boxSize={5}
          color={hasVideo ? '#4C8F6D' : '#C98A4A'}
        />
      </Flex>

      <Box flex={1}>
        <Text fontSize="14px" fontWeight="600" color="#3E3E3C">
          {lesson.order_index}. {lesson.title}
        </Text>
        <HStack gap={3} mt={1}>
          {hasVideo && (
            <Badge
              fontSize="10px"
              px={2}
              py={0.5}
              borderRadius="full"
              bg="#E8F5EE"
              color="#4C8F6D"
            >
              Видео
            </Badge>
          )}
          {materialsCount > 0 && (
            <HStack gap={1}>
              <Icon as={FiDownload} boxSize={3} color="#6F6F6A" />
              <Text fontSize="12px" color="#6F6F6A">
                {materialsCount} файл{materialsCount > 1 ? 'ов' : ''}
              </Text>
            </HStack>
          )}
          {lesson.homework_required && (
            <HStack gap={1}>
              <Icon as={FiClipboard} boxSize={3} color="#6F6F6A" />
              <Text fontSize="12px" color="#6F6F6A">ДЗ</Text>
            </HStack>
          )}
        </HStack>
      </Box>

      <HStack gap={1}>
        <Button
          variant="ghost"
          size="sm"
          borderRadius="8px"
          color="#6F6F6A"
          _hover={{ bg: '#EFE8E0', color: '#3E3E3C' }}
          onClick={onEdit}
        >
          <Icon as={FiEdit2} boxSize={4} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          borderRadius="8px"
          color="#6F6F6A"
          _hover={{ bg: '#FDF6ED', color: '#C98A4A' }}
          onClick={onDelete}
        >
          <Icon as={FiTrash2} boxSize={4} />
        </Button>
      </HStack>
    </Flex>
  )
}
