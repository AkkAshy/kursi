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
  Avatar,
  Card,
  Spinner,
} from '@chakra-ui/react'
import {
  FiBook,
  FiUsers,
  FiMessageSquare,
  FiAlertCircle,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useLeadsStore } from '@/stores/leadsStore'
import { BotLead } from '@/types'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Только что'
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`
  return date.toLocaleDateString('ru-RU')
}

function getLeadName(lead: BotLead): string {
  if (lead.full_name) return lead.full_name
  if (lead.first_name && lead.last_name) return `${lead.first_name} ${lead.last_name}`
  if (lead.first_name) return lead.first_name
  return lead.telegram_username || 'Без имени'
}

function getLeadInitials(lead: BotLead): string {
  const name = getLeadName(lead)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const { courses, isLoading: coursesLoading, fetchMyCourses } = useCoursesStore()
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadsStore()

  useEffect(() => {
    fetchMyCourses()
    fetchLeads()
  }, [fetchMyCourses, fetchLeads])

  const isLoading = coursesLoading || leadsLoading
  const totalStudents = courses.reduce((sum, c) => sum + (c.students_count || 0), 0)
  const newLeadsCount = leads.filter(l => l.status === 'new').length
  const recentLeads = leads.slice(0, 5)

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <Box maxW="1120px">
      {/* Hero Block */}
      <Box
        bg="white"
        borderRadius="20px"
        p={8}
        mb={8}
        boxShadow="0 4px 16px -2px rgba(0,0,0,0.08)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.03}
          pointerEvents="none"
          bgImage="url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')"
        />

        <Flex gap={8} align="center" position="relative">
          <Avatar.Root size="2xl" borderRadius="20px">
            <Avatar.Fallback
              bg="linear-gradient(135deg, #4C8F6D 0%, #79C69F 100%)"
              color="white"
              fontSize="3xl"
              fontWeight="bold"
            >
              {user ? getInitials(user.username) : '??'}
            </Avatar.Fallback>
          </Avatar.Root>

          <VStack align="start" gap={2}>
            <Heading
              as="h1"
              fontSize="36px"
              fontWeight="bold"
              color="#3E3E3C"
              letterSpacing="-0.5px"
            >
              Добро пожаловать, {user?.full_name || user?.username || 'Загрузка...'}!
            </Heading>
            <Text fontSize="18px" color="#6F6F6A" fontWeight="500">
              {user?.role === 'creator' ? 'Преподаватель' : 'Пользователь'}
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px">
          <VStack gap={4}>
            <Spinner size="xl" color="#4C8F6D" />
            <Text color="#6F6F6A">Загрузка данных...</Text>
          </VStack>
        </Flex>
      )}

      {/* Stats Grid */}
      {!isLoading && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
            <Card.Root
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              overflow="hidden"
              transition="all 0.2s ease-out"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
              }}
            >
              <Card.Body p={6}>
                <HStack justify="space-between" mb={4}>
                  <Flex
                    w={12}
                    h={12}
                    bg="#E8F5EE"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiBook} boxSize={6} color="#4C8F6D" />
                  </Flex>
                </HStack>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C" mb={1}>
                  {courses.length}
                </Text>
                <Text fontSize="14px" color="#6F6F6A">
                  Курсов
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              overflow="hidden"
              transition="all 0.2s ease-out"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
              }}
            >
              <Card.Body p={6}>
                <HStack justify="space-between" mb={4}>
                  <Flex
                    w={12}
                    h={12}
                    bg="#FDF6ED"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUsers} boxSize={6} color="#C98A4A" />
                  </Flex>
                </HStack>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C" mb={1}>
                  {totalStudents}
                </Text>
                <Text fontSize="14px" color="#6F6F6A">
                  Студентов
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root
              bg="white"
              borderRadius="16px"
              boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
              border="1px solid"
              borderColor="#EFE8E0"
              overflow="hidden"
              transition="all 0.2s ease-out"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
              }}
            >
              <Card.Body p={6}>
                <HStack justify="space-between" mb={4}>
                  <Flex
                    w={12}
                    h={12}
                    bg="#E8F5EE"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiMessageSquare} boxSize={6} color="#4C8F6D" />
                  </Flex>
                </HStack>
                <Text fontSize="28px" fontWeight="bold" color="#3E3E3C" mb={1}>
                  {leads.length}
                </Text>
                <Text fontSize="14px" color="#6F6F6A">
                  Лидов ({newLeadsCount} новых)
                </Text>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>

          {/* Recent Leads */}
          <Card.Root
            bg="white"
            borderRadius="16px"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
            border="1px solid"
            borderColor="#EFE8E0"
          >
            <Card.Header p={6} pb={4}>
              <HStack justify="space-between">
                <Heading size="md" color="#3E3E3C">
                  Недавние лиды
                </Heading>
                <NextLink href="/teacher/leads">
                  <Text
                    fontSize="14px"
                    color="#4C8F6D"
                    fontWeight="600"
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Смотреть все
                  </Text>
                </NextLink>
              </HStack>
            </Card.Header>
            <Card.Body p={6} pt={0}>
              {recentLeads.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={8}
                  color="#6F6F6A"
                >
                  <Icon as={FiAlertCircle} boxSize={8} mb={3} />
                  <Text>Пока нет лидов</Text>
                </Flex>
              ) : (
                <VStack gap={4} align="stretch">
                  {recentLeads.map((lead) => (
                    <Flex
                      key={lead.id}
                      align="center"
                      justify="space-between"
                      p={4}
                      bg="#FDFBF8"
                      borderRadius="12px"
                      transition="all 0.15s ease-out"
                      _hover={{ bg: '#FAF7F2' }}
                    >
                      <HStack gap={4}>
                        <Avatar.Root size="sm">
                          <Avatar.Fallback bg="#DDE8DD" color="#4C8F6D" fontSize="sm">
                            {getLeadInitials(lead)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Box>
                          <Text fontWeight="600" color="#3E3E3C" fontSize="14px">
                            {getLeadName(lead)}
                          </Text>
                          <Text fontSize="13px" color="#6F6F6A">
                            {lead.interested_course_title || 'Без курса'}
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="13px" color="#6F6F6A">
                        {formatDate(lead.created_at)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </>
      )}
    </Box>
  )
}
