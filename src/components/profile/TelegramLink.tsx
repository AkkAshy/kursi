'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Flex,
  Card,
  Button,
  Spinner,
} from '@chakra-ui/react'
import { FiMessageCircle, FiCheck, FiCopy, FiX } from 'react-icons/fi'
import api from '@/lib/api'

export function TelegramLinkCard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLinked, setIsLinked] = useState(false)
  const [telegramId, setTelegramId] = useState<number | null>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [botUsername, setBotUsername] = useState('kursi_testbot')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadTelegramStatus()
  }, [])

  const loadTelegramStatus = async () => {
    try {
      const status = await api.getTelegramStatus()
      setIsLinked(status.linked)
      setTelegramId(status.telegram_id)
    } catch (err) {
      console.error('Error loading telegram status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    try {
      const result = await api.generateTelegramLinkCode()
      setLinkCode(result.code)
      setBotUsername(result.bot_username)
    } catch (err) {
      console.error('Error generating code:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUnlink = async () => {
    setIsUnlinking(true)
    try {
      await api.unlinkTelegram()
      setIsLinked(false)
      setTelegramId(null)
    } catch (err) {
      console.error('Error unlinking:', err)
    } finally {
      setIsUnlinking(false)
    }
  }

  const copyCommand = () => {
    navigator.clipboard.writeText(`/link ${linkCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <Card.Root
        bg="white"
        borderRadius="20px"
        boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Body p={6}>
          <Flex justify="center" py={4}>
            <Spinner color="#4C8F6D" />
          </Flex>
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <Card.Root
      bg="white"
      borderRadius="20px"
      boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
      border="1px solid"
      borderColor="#EFE8E0"
    >
      <Card.Header p={6} pb={4}>
        <Heading size="sm" color="#3E3E3C">
          Telegram уведомления
        </Heading>
      </Card.Header>
      <Card.Body p={6} pt={0}>
        {isLinked ? (
          // Telegram привязан
          <VStack gap={4} align="stretch">
            <Flex
              bg="#E8F5EE"
              p={4}
              borderRadius="12px"
              align="center"
              gap={3}
            >
              <Box
                w={10}
                h={10}
                bg="#4C8F6D"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiCheck} color="white" boxSize={5} />
              </Box>
              <Box flex={1}>
                <Text fontWeight="600" color="#3E3E3C" fontSize="15px">
                  Telegram привязан
                </Text>
                <Text color="#6F6F6A" fontSize="13px">
                  ID: {telegramId}
                </Text>
              </Box>
            </Flex>

            <Text color="#6F6F6A" fontSize="14px">
              Вы будете получать уведомления о:
            </Text>
            <VStack align="start" gap={1} pl={2}>
              <Text color="#6F6F6A" fontSize="13px">• Новых уроках в ваших курсах</Text>
              <Text color="#6F6F6A" fontSize="13px">• Проверке домашних заданий</Text>
              <Text color="#6F6F6A" fontSize="13px">• Важных обновлениях</Text>
            </VStack>

            <Button
              variant="ghost"
              color="#DC2626"
              size="sm"
              onClick={handleUnlink}
              disabled={isUnlinking}
              _hover={{ bg: '#FEE2E2' }}
            >
              {isUnlinking ? <Spinner size="sm" /> : (
                <>
                  <Icon as={FiX} mr={2} />
                  Отвязать Telegram
                </>
              )}
            </Button>
          </VStack>
        ) : linkCode ? (
          // Показываем ссылку для привязки
          <VStack gap={4} align="stretch">
            <Box
              bg="#E8F5EE"
              p={4}
              borderRadius="12px"
              textAlign="center"
            >
              <Text fontWeight="600" color="#4C8F6D" fontSize="14px" mb={3}>
                Нажмите кнопку для привязки
              </Text>
              <Button
                as="a"
                href={`https://t.me/${botUsername}?start=link_${linkCode}`}
                target="_blank"
                bg="#0088cc"
                color="white"
                size="lg"
                borderRadius="12px"
                w="full"
                _hover={{ bg: '#0077b5' }}
              >
                <Icon as={FiMessageCircle} mr={2} />
                Открыть Telegram
              </Button>
              <Text color="#6F6F6A" fontSize="12px" mt={3}>
                Ссылка действительна 10 минут
              </Text>
            </Box>

            <HStack justify="center" gap={2}>
              <Text color="#6F6F6A" fontSize="13px">
                Или вручную: отправьте боту
              </Text>
              <HStack
                bg="#F3F4F6"
                px={2}
                py={1}
                borderRadius="6px"
                cursor="pointer"
                onClick={copyCommand}
              >
                <Text fontFamily="monospace" fontSize="13px" color="#3E3E3C">
                  /link {linkCode}
                </Text>
                <Icon as={copied ? FiCheck : FiCopy} boxSize={3} color={copied ? '#4C8F6D' : '#6F6F6A'} />
              </HStack>
            </HStack>

            <Button
              variant="ghost"
              color="#6F6F6A"
              size="sm"
              onClick={() => setLinkCode(null)}
            >
              Отмена
            </Button>
          </VStack>
        ) : (
          // Telegram не привязан
          <VStack gap={4} align="stretch">
            <Flex align="center" gap={3}>
              <Box
                w={10}
                h={10}
                bg="#F3F4F6"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiMessageCircle} color="#6F6F6A" boxSize={5} />
              </Box>
              <Box flex={1}>
                <Text fontWeight="600" color="#3E3E3C" fontSize="15px">
                  Telegram не привязан
                </Text>
                <Text color="#6F6F6A" fontSize="13px">
                  Привяжите для получения уведомлений
                </Text>
              </Box>
            </Flex>

            <Button
              bg="#0088cc"
              color="white"
              borderRadius="10px"
              onClick={handleGenerateCode}
              disabled={isGenerating}
              _hover={{ bg: '#0077b5' }}
            >
              {isGenerating ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Icon as={FiMessageCircle} mr={2} />
                  Привязать Telegram
                </>
              )}
            </Button>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  )
}
