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
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Spinner,
} from '@chakra-ui/react'
import {
  FiSearch,
  FiPhone,
  FiMessageCircle,
  FiCalendar,
  FiBook,
  FiCheck,
  FiX,
  FiSend,
  FiAlertCircle,
  FiUsers,
} from 'react-icons/fi'
import { useLeadsStore } from '@/stores/leadsStore'
import { BotLead } from '@/types'

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: '#E8F5EE', color: '#4C8F6D', label: 'Новый' },
  contacted: { bg: '#FDF6ED', color: '#C98A4A', label: 'Связались' },
  trial_sent: { bg: '#DDE8DD', color: '#558855', label: 'Пробник отправлен' },
  purchased: { bg: '#E8F5EE', color: '#4C8F6D', label: 'Купил' },
  rejected: { bg: '#F7F3F1', color: '#6F6F6A', label: 'Отказ' },
}

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

export default function LeadsPage() {
  const { leads, isLoading, error, fetchLeads, updateLeadStatus } = useLeadsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [updatingLeadId, setUpdatingLeadId] = useState<number | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusUpdate = async (leadId: number, newStatus: BotLead['status']) => {
    setUpdatingLeadId(leadId)
    try {
      await updateLeadStatus(leadId, newStatus)
    } finally {
      setUpdatingLeadId(null)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' ||
      getLeadName(lead).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery)) ||
      (lead.telegram_username && lead.telegram_username.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = !statusFilter || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const newLeadsCount = leads.filter(l => l.status === 'new').length

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
            Лиды из бота
          </Heading>
          <Text color="#6F6F6A" fontSize="15px">
            Управляйте заявками от потенциальных студентов
          </Text>
        </Box>

        <HStack gap={3}>
          {newLeadsCount > 0 && (
            <Badge
              px={4}
              py={2}
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              bg="#E8F5EE"
              color="#4C8F6D"
            >
              {newLeadsCount} новых
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* Filters */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
        mb={6}
      >
        <Card.Body p={4}>
          <Flex gap={4} align="center" flexWrap="wrap">
            <Box position="relative" flex={1} minW="200px">
              <Icon
                as={FiSearch}
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                color="#6F6F6A"
                boxSize={4}
              />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl={11}
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                fontSize="14px"
                _focus={{
                  borderColor: '#4C8F6D',
                  boxShadow: '0 0 0 1px #4C8F6D',
                }}
              />
            </Box>

            <HStack gap={2}>
              <Button
                size="sm"
                variant={!statusFilter ? 'solid' : 'outline'}
                bg={!statusFilter ? '#4C8F6D' : 'transparent'}
                color={!statusFilter ? 'white' : '#6F6F6A'}
                borderColor="#EFE8E0"
                borderRadius="10px"
                onClick={() => setStatusFilter(null)}
                _hover={{ bg: !statusFilter ? '#3F7A5C' : '#FAF7F2' }}
              >
                Все
              </Button>
              {Object.entries(statusColors).map(([key, value]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={statusFilter === key ? 'solid' : 'outline'}
                  bg={statusFilter === key ? value.color : 'transparent'}
                  color={statusFilter === key ? 'white' : '#6F6F6A'}
                  borderColor="#EFE8E0"
                  borderRadius="10px"
                  onClick={() => setStatusFilter(key)}
                  _hover={{ bg: statusFilter === key ? value.color : '#FAF7F2' }}
                >
                  {value.label}
                </Button>
              ))}
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" minH="300px">
          <VStack gap={4}>
            <Spinner size="xl" color="#4C8F6D" />
            <Text color="#6F6F6A">Загрузка лидов...</Text>
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
      {!isLoading && !error && filteredLeads.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="300px"
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
            <Icon as={FiUsers} boxSize={10} color="#4C8F6D" />
          </Flex>
          <Heading as="h3" fontSize="20px" color="#3E3E3C" mb={2}>
            {leads.length === 0 ? 'Нет лидов' : 'Лиды не найдены'}
          </Heading>
          <Text color="#6F6F6A" fontSize="15px" textAlign="center" maxW="300px">
            {leads.length === 0
              ? 'Когда пользователи начнут взаимодействовать с вашим ботом, они появятся здесь'
              : 'Попробуйте изменить параметры поиска'}
          </Text>
        </Flex>
      )}

      {/* Leads List */}
      {!isLoading && filteredLeads.length > 0 && (
        <VStack gap={4} align="stretch">
          {filteredLeads.map((lead) => {
            const status = statusColors[lead.status] || statusColors.new
            const isUpdating = updatingLeadId === lead.id
            return (
              <Card.Root
                key={lead.id}
                bg="white"
                borderRadius="16px"
                boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
                border="1px solid"
                borderColor="#EFE8E0"
                overflow="hidden"
                transition="all 0.2s ease-out"
                opacity={isUpdating ? 0.7 : 1}
                _hover={{
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                }}
              >
                {/* Status bar */}
                <Box
                  h="3px"
                  bg={status.bg}
                  position="relative"
                >
                  <Box
                    position="absolute"
                    left={0}
                    top={0}
                    h="full"
                    w={
                      lead.status === 'new' ? '25%' :
                      lead.status === 'contacted' ? '50%' :
                      lead.status === 'trial_sent' ? '75%' : '100%'
                    }
                    bg={status.color}
                    transition="width 0.3s"
                  />
                </Box>

                <Card.Body p={6}>
                  <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                    <HStack gap={4} align="start">
                      <Avatar.Root size="lg" borderRadius="14px">
                        <Avatar.Fallback
                          bg={status.bg}
                          color={status.color}
                          fontSize="lg"
                          fontWeight="bold"
                        >
                          {getLeadInitials(lead)}
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <Box>
                        <HStack gap={3} mb={1} flexWrap="wrap">
                          <Text fontSize="16px" fontWeight="bold" color="#3E3E3C">
                            {getLeadName(lead)}
                          </Text>
                          <Badge
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="11px"
                            fontWeight="600"
                            bg={status.bg}
                            color={status.color}
                          >
                            {status.label}
                          </Badge>
                        </HStack>

                        <HStack gap={4} mt={2} flexWrap="wrap">
                          {lead.telegram_username && (
                            <HStack gap={2}>
                              <Icon as={FiMessageCircle} boxSize={4} color="#6F6F6A" />
                              <Text fontSize="13px" color="#6F6F6A">
                                {lead.telegram_username}
                              </Text>
                            </HStack>
                          )}
                          {lead.phone && (
                            <HStack gap={2}>
                              <Icon as={FiPhone} boxSize={4} color="#6F6F6A" />
                              <Text fontSize="13px" color="#6F6F6A">
                                {lead.phone}
                              </Text>
                            </HStack>
                          )}
                          {lead.birth_date && (
                            <HStack gap={2}>
                              <Icon as={FiCalendar} boxSize={4} color="#6F6F6A" />
                              <Text fontSize="13px" color="#6F6F6A">
                                {lead.birth_date}
                              </Text>
                            </HStack>
                          )}
                        </HStack>

                        {lead.interested_course_title && (
                          <HStack gap={2} mt={3}>
                            <Icon as={FiBook} boxSize={4} color="#4C8F6D" />
                            <Text fontSize="13px" color="#4C8F6D" fontWeight="500">
                              {lead.interested_course_title}
                            </Text>
                          </HStack>
                        )}
                      </Box>
                    </HStack>

                    <VStack align="end" gap={3}>
                      <Text fontSize="12px" color="#6F6F6A">
                        {formatDate(lead.created_at)}
                      </Text>

                      <HStack gap={2}>
                        {lead.status === 'new' && (
                          <>
                            <Button
                              size="sm"
                              bg="#4C8F6D"
                              color="white"
                              borderRadius="10px"
                              fontSize="12px"
                              loading={isUpdating}
                              onClick={() => handleStatusUpdate(lead.id, 'trial_sent')}
                              _hover={{ bg: '#3F7A5C' }}
                            >
                              <Icon as={FiSend} mr={2} boxSize={3} />
                              Отправить пробник
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              borderColor="#EFE8E0"
                              color="#6F6F6A"
                              borderRadius="10px"
                              fontSize="12px"
                              loading={isUpdating}
                              onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                              _hover={{ borderColor: '#4C8F6D', color: '#4C8F6D' }}
                            >
                              <Icon as={FiPhone} mr={2} boxSize={3} />
                              Связались
                            </Button>
                          </>
                        )}
                        {lead.status === 'contacted' && (
                          <Button
                            size="sm"
                            bg="#4C8F6D"
                            color="white"
                            borderRadius="10px"
                            fontSize="12px"
                            loading={isUpdating}
                            onClick={() => handleStatusUpdate(lead.id, 'trial_sent')}
                            _hover={{ bg: '#3F7A5C' }}
                          >
                            <Icon as={FiSend} mr={2} boxSize={3} />
                            Отправить пробник
                          </Button>
                        )}
                        {lead.status === 'trial_sent' && (
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              bg="#4C8F6D"
                              color="white"
                              borderRadius="10px"
                              fontSize="12px"
                              loading={isUpdating}
                              onClick={() => handleStatusUpdate(lead.id, 'purchased')}
                              _hover={{ bg: '#3F7A5C' }}
                            >
                              <Icon as={FiCheck} mr={2} boxSize={3} />
                              Купил
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              borderColor="#EFE8E0"
                              color="#C98A4A"
                              borderRadius="10px"
                              fontSize="12px"
                              loading={isUpdating}
                              onClick={() => handleStatusUpdate(lead.id, 'rejected')}
                              _hover={{ borderColor: '#C98A4A' }}
                            >
                              <Icon as={FiX} mr={2} boxSize={3} />
                              Отказ
                            </Button>
                          </HStack>
                        )}
                        {(lead.status === 'purchased' || lead.status === 'rejected') && (
                          <Badge
                            px={3}
                            py={2}
                            borderRadius="10px"
                            fontSize="12px"
                            fontWeight="500"
                            bg={status.bg}
                            color={status.color}
                          >
                            {lead.status === 'purchased' ? 'Конверсия завершена' : 'Закрыт'}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Flex>
                </Card.Body>
              </Card.Root>
            )
          })}
        </VStack>
      )}
    </Box>
  )
}
