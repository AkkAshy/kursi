'use client'

import { useState, useRef } from 'react'
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
  Spinner,
} from '@chakra-ui/react'
import { FiArrowLeft, FiSave, FiAlertCircle, FiUpload, FiVideo, FiX } from 'react-icons/fi'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCoursesStore } from '@/stores/coursesStore'

export default function CreateCoursePage() {
  const router = useRouter()
  const { createCourse, isLoading, error, clearError } = useCoursesStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [trialText, setTrialText] = useState('')
  const [trialVideo, setTrialVideo] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Проверяем что это видео
      if (!file.type.startsWith('video/')) {
        alert('Пожалуйста, выберите видео файл')
        return
      }
      // Проверяем размер (максимум 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 100MB')
        return
      }
      setTrialVideo(file)
    }
  }

  const handleRemoveVideo = () => {
    setTrialVideo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    try {
      const course = await createCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseInt(price) || 0,
        trial_text: trialText.trim() || undefined,
        trial_video: trialVideo || undefined,
      })
      // Перенаправляем на страницу курса после создания
      router.push(`/teacher/courses/${course.id}`)
    } catch {
      // Ошибка обрабатывается в store
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Box maxW="800px">
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
              Создать курс
            </Heading>
            <Text fontSize="14px" color="#6F6F6A" mt={1}>
              Заполните информацию о новом курсе
            </Text>
          </Box>
        </HStack>

        <Button
          bg="#4C8F6D"
          color="white"
          borderRadius="12px"
          fontSize="14px"
          fontWeight="600"
          boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
          _hover={{ bg: '#3F7A5C' }}
          onClick={handleSubmit}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? <Spinner size="sm" mr={2} /> : <Icon as={FiSave} mr={2} />}
          Создать курс
        </Button>
      </Flex>

      {/* Error Message */}
      {error && (
        <Flex
          bg="#FDF6ED"
          borderRadius="12px"
          p={4}
          align="center"
          gap={3}
          mb={6}
        >
          <Icon as={FiAlertCircle} color="#C98A4A" boxSize={5} />
          <Text fontSize="14px" color="#C98A4A" flex={1}>
            {error}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            color="#C98A4A"
            onClick={clearError}
          >
            Закрыть
          </Button>
        </Flex>
      )}

      {/* Course Info Card */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        mb={6}
      >
        <Card.Header p={6} pb={4}>
          <Heading size="sm" color="#3E3E3C">
            Основная информация
          </Heading>
        </Card.Header>
        <Card.Body p={6} pt={0}>
          <VStack gap={5} align="stretch">
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Название курса *
              </Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Основы веб-разработки"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите, чему научатся студенты на вашем курсе"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100000"
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

      {/* Trial Materials Card */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Header p={6} pb={4}>
          <Heading size="sm" color="#3E3E3C">
            Пробные материалы
          </Heading>
          <Text fontSize="13px" color="#6F6F6A" mt={1}>
            Эти материалы будут отправлены через Telegram-бота для привлечения студентов
          </Text>
        </Card.Header>
        <Card.Body p={6} pt={0}>
          <VStack gap={5} align="stretch">
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Пробный текст
              </Text>
              <Textarea
                value={trialText}
                onChange={(e) => setTrialText(e.target.value)}
                placeholder="Приветственное сообщение или краткое описание того, что получит студент"
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

            <Box>
              <Text fontSize="13px" fontWeight="600" color="#6F6F6A" mb={2}>
                Пробное видео
              </Text>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {trialVideo ? (
                // Selected file display
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
                    <Text fontSize="14px" fontWeight="600" color="#3E3E3C" noOfLines={1}>
                      {trialVideo.name}
                    </Text>
                    <Text fontSize="12px" color="#6F6F6A">
                      {formatFileSize(trialVideo.size)}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#C98A4A"
                    borderRadius="8px"
                    onClick={handleRemoveVideo}
                    _hover={{ bg: '#FDF6ED' }}
                  >
                    <Icon as={FiX} boxSize={4} />
                  </Button>
                </Flex>
              ) : (
                // Upload area
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  p={8}
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Flex
                    w={12}
                    h={12}
                    bg="white"
                    borderRadius="full"
                    align="center"
                    justify="center"
                    mb={3}
                    boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                  >
                    <Icon as={FiUpload} boxSize={6} color="#4C8F6D" />
                  </Flex>
                  <Text fontSize="14px" fontWeight="600" color="#3E3E3C" mb={1}>
                    Загрузить видео
                  </Text>
                  <Text fontSize="12px" color="#6F6F6A">
                    MP4, MOV, AVI до 100MB
                  </Text>
                </Flex>
              )}
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Bottom Submit Button */}
      <Flex justify="flex-end" mt={6} gap={3}>
        <NextLink href="/teacher/courses">
          <Button
            variant="outline"
            borderColor="#EFE8E0"
            color="#6F6F6A"
            borderRadius="12px"
            fontSize="14px"
            fontWeight="600"
            _hover={{ borderColor: '#3E3E3C', color: '#3E3E3C' }}
          >
            Отмена
          </Button>
        </NextLink>
        <Button
          bg="#4C8F6D"
          color="white"
          borderRadius="12px"
          fontSize="14px"
          fontWeight="600"
          boxShadow="0 4px 16px -2px rgba(76, 143, 109, 0.3)"
          _hover={{ bg: '#3F7A5C' }}
          onClick={handleSubmit}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? <Spinner size="sm" mr={2} /> : <Icon as={FiSave} mr={2} />}
          Создать курс
        </Button>
      </Flex>
    </Box>
  )
}
