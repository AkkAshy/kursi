'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
} from '@chakra-ui/react'
import { FiBell, FiAlertCircle, FiCreditCard, FiRefreshCw } from 'react-icons/fi'
import api from '@/lib/api'
import { AdminNotification } from '@/types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000) // Проверяем каждые 30 сек
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const data = await api.getAdminNotificationsUnreadCount()
      setUnreadCount(data.count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await api.getAdminNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleCheckOverdue = async () => {
    setIsLoading(true)
    try {
      const result = await api.checkOverduePayments()
      if (result.created_count > 0) {
        await loadNotifications()
        await loadUnreadCount()
      }
      alert(result.message)
    } catch (error) {
      console.error('Failed to check overdue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'только что'
    if (hours < 24) return `${hours} ч. назад`
    if (days < 7) return `${days} дн. назад`
    return date.toLocaleDateString('ru-RU')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return FiAlertCircle
      case 'new_payment':
        return FiCreditCard
      default:
        return FiBell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return '#E53E3E'
      case 'new_payment':
        return '#4C8F6D'
      default:
        return '#C98A4A'
    }
  }

  return (
    <Box position="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        p={2}
        borderRadius="full"
        position="relative"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: '#EFE8E0' }}
      >
        <Icon as={FiBell} boxSize={5} color="#3E3E3C" />
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top={0}
            right={0}
            bg="#E53E3E"
            color="white"
            borderRadius="full"
            fontSize="10px"
            minW="18px"
            h="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          right={0}
          mt={2}
          w="360px"
          bg="white"
          borderRadius="12px"
          boxShadow="0 4px 20px rgba(0,0,0,0.15)"
          border="1px solid"
          borderColor="#EFE8E0"
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          {/* Header */}
          <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="#EFE8E0">
            <Text fontWeight="600" color="#3E3E3C">Уведомления</Text>
            <HStack gap={2}>
              <Button
                size="xs"
                variant="ghost"
                color="#C98A4A"
                onClick={handleCheckOverdue}
                disabled={isLoading}
              >
                <Icon as={FiRefreshCw} mr={1} />
                Проверить
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#4C8F6D"
                  onClick={handleMarkAllRead}
                >
                  Прочитать все
                </Button>
              )}
            </HStack>
          </HStack>

          {/* Notifications List */}
          <VStack align="stretch" gap={0}>
            {isLoading ? (
              <Box p={4} textAlign="center">
                <Text color="#6F6F6A" fontSize="14px">Загрузка...</Text>
              </Box>
            ) : notifications.length === 0 ? (
              <Box p={8} textAlign="center">
                <Icon as={FiBell} boxSize={8} color="#D4D4D4" mb={2} />
                <Text color="#6F6F6A" fontSize="14px">Нет уведомлений</Text>
              </Box>
            ) : (
              notifications.map((notification) => (
                <HStack
                  key={notification.id}
                  p={4}
                  gap={3}
                  align="flex-start"
                  bg={notification.is_read ? 'transparent' : '#FAF7F2'}
                  borderBottom="1px solid"
                  borderColor="#EFE8E0"
                  _hover={{ bg: '#FAF7F2' }}
                  cursor="pointer"
                  onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                >
                  <Icon
                    as={getNotificationIcon(notification.type)}
                    boxSize={5}
                    color={getNotificationColor(notification.type)}
                    mt={0.5}
                  />
                  <Box flex={1}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#3E3E3C">
                        {notification.type_display}
                      </Text>
                      <Text fontSize="11px" color="#9F9F9A">
                        {formatDate(notification.created_at)}
                      </Text>
                    </HStack>
                    <Text fontSize="13px" color="#6F6F6A" lineHeight="1.4">
                      {notification.message}
                    </Text>
                  </Box>
                  {!notification.is_read && (
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="#4C8F6D"
                      flexShrink={0}
                      mt={1}
                    />
                  )}
                </HStack>
              ))
            )}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
