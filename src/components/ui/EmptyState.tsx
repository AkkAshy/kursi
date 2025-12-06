'use client'

import { VStack, Heading, Text, Icon, Button, Flex, Card } from '@chakra-ui/react'
import {
  FiBook,
  FiUsers,
  FiShoppingBag,
  FiClipboard,
  FiInbox,
  FiSearch,
  FiPlus,
  FiFileText,
} from 'react-icons/fi'
import NextLink from 'next/link'

type EmptyStateType =
  | 'courses'
  | 'lessons'
  | 'students'
  | 'homeworks'
  | 'purchases'
  | 'leads'
  | 'search'
  | 'generic'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const emptyStateConfig: Record<EmptyStateType, { icon: React.ElementType; defaultTitle: string; defaultDescription: string }> = {
  courses: {
    icon: FiBook,
    defaultTitle: 'Нет курсов',
    defaultDescription: 'Создайте свой первый курс и начните обучать студентов',
  },
  lessons: {
    icon: FiFileText,
    defaultTitle: 'Нет уроков',
    defaultDescription: 'Добавьте уроки, чтобы наполнить курс контентом',
  },
  students: {
    icon: FiUsers,
    defaultTitle: 'Нет студентов',
    defaultDescription: 'Поделитесь курсом, чтобы привлечь первых студентов',
  },
  homeworks: {
    icon: FiClipboard,
    defaultTitle: 'Нет домашних заданий',
    defaultDescription: 'Здесь появятся домашние задания студентов',
  },
  purchases: {
    icon: FiShoppingBag,
    defaultTitle: 'Нет покупок',
    defaultDescription: 'Ваши покупки курсов появятся здесь',
  },
  leads: {
    icon: FiInbox,
    defaultTitle: 'Нет лидов',
    defaultDescription: 'Лиды из Telegram-бота появятся здесь',
  },
  search: {
    icon: FiSearch,
    defaultTitle: 'Ничего не найдено',
    defaultDescription: 'Попробуйте изменить параметры поиска',
  },
  generic: {
    icon: FiInbox,
    defaultTitle: 'Пусто',
    defaultDescription: 'Здесь пока ничего нет',
  },
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const config = emptyStateConfig[type]

  return (
    <Card.Root
      bg="white"
      borderRadius="20px"
      boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
      border="1px solid"
      borderColor="#EFE8E0"
    >
      <Card.Body p={{ base: 8, md: 12 }}>
        <VStack gap={5}>
          <Flex
            w={{ base: 16, md: 20 }}
            h={{ base: 16, md: 20 }}
            bg="#E8F5EE"
            borderRadius="20px"
            align="center"
            justify="center"
          >
            <Icon as={config.icon} boxSize={{ base: 8, md: 10 }} color="#4C8F6D" />
          </Flex>
          <VStack gap={2}>
            <Heading size="md" color="#3E3E3C" textAlign="center">
              {title || config.defaultTitle}
            </Heading>
            <Text
              color="#6F6F6A"
              textAlign="center"
              maxW="400px"
              fontSize={{ base: 'sm', md: 'md' }}
            >
              {description || config.defaultDescription}
            </Text>
          </VStack>
          {(actionLabel && (actionHref || onAction)) && (
            actionHref ? (
              <NextLink href={actionHref}>
                <Button
                  bg="#4C8F6D"
                  color="white"
                  borderRadius="12px"
                  px={6}
                  _hover={{ bg: '#3F7A5C' }}
                >
                  <Icon as={FiPlus} mr={2} />
                  {actionLabel}
                </Button>
              </NextLink>
            ) : (
              <Button
                bg="#4C8F6D"
                color="white"
                borderRadius="12px"
                px={6}
                onClick={onAction}
                _hover={{ bg: '#3F7A5C' }}
              >
                <Icon as={FiPlus} mr={2} />
                {actionLabel}
              </Button>
            )
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

// Compact inline empty state
export function EmptyStateInline({
  type,
  title,
  description,
}: {
  type: EmptyStateType
  title?: string
  description?: string
}) {
  const config = emptyStateConfig[type]

  return (
    <Flex
      p={6}
      bg="#FDFBF8"
      borderRadius="16px"
      border="1px dashed"
      borderColor="#EFE8E0"
      align="center"
      gap={4}
    >
      <Flex
        w={12}
        h={12}
        bg="#E8F5EE"
        borderRadius="12px"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={config.icon} boxSize={6} color="#4C8F6D" />
      </Flex>
      <VStack align="start" gap={1}>
        <Text fontWeight="600" color="#3E3E3C" fontSize="sm">
          {title || config.defaultTitle}
        </Text>
        <Text color="#6F6F6A" fontSize="sm">
          {description || config.defaultDescription}
        </Text>
      </VStack>
    </Flex>
  )
}
