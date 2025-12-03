'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  Avatar,
} from '@chakra-ui/react'
import {
  FiHome,
  FiBook,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiLink,
  FiCreditCard,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Главная', href: '/teacher', icon: FiHome },
  { label: 'Мои курсы', href: '/teacher/courses', icon: FiBook },
  { label: 'Лиды', href: '/teacher/leads', icon: FiUsers },
  { label: 'Платежи', href: '/teacher/payments', icon: FiCreditCard },
  { label: 'Бот-ссылка', href: '/teacher/bot-link', icon: FiLink },
  { label: 'Настройки', href: '/teacher/settings', icon: FiSettings },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <Box
      as="aside"
      w="260px"
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="#EFE8E0"
      position="fixed"
      left={0}
      top={0}
      py={6}
      display="flex"
      flexDirection="column"
    >
      {/* Logo */}
      <Box px={6} mb={8}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="#4C8F6D"
          letterSpacing="-0.5px"
        >
          Kursi
        </Text>
      </Box>

      {/* User Info */}
      <Box px={6} mb={8}>
        <HStack gap={3}>
          <Avatar.Root size="md">
            <Avatar.Fallback bg="#4C8F6D" color="white">
              {user ? getInitials(user.username) : '??'}
            </Avatar.Fallback>
          </Avatar.Root>
          <Box>
            <Text fontWeight="600" color="#3E3E3C" fontSize="sm">
              {user?.full_name || user?.username || 'Загрузка...'}
            </Text>
            <Text fontSize="xs" color="#6F6F6A">
              {user?.role === 'creator' ? 'Преподаватель' : 'Пользователь'}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Navigation */}
      <VStack gap={1} px={3} flex={1}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/teacher' && pathname?.startsWith(item.href))

          return (
            <NextLink key={item.href} href={item.href} style={{ width: '100%' }}>
              <Flex
                align="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="12px"
                cursor="pointer"
                bg={isActive ? '#E8F5EE' : 'transparent'}
                color={isActive ? '#4C8F6D' : '#6F6F6A'}
                fontWeight={isActive ? '600' : '500'}
                transition="all 0.2s ease-out"
                _hover={{
                  bg: isActive ? '#E8F5EE' : '#FAF7F2',
                  color: isActive ? '#4C8F6D' : '#3E3E3C',
                }}
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontSize="sm">{item.label}</Text>
                {isActive && (
                  <Box
                    position="absolute"
                    left={0}
                    w="4px"
                    h="24px"
                    bg="#4C8F6D"
                    borderRadius="0 4px 4px 0"
                  />
                )}
              </Flex>
            </NextLink>
          )
        })}
      </VStack>

      {/* Logout */}
      <Box px={3} mt="auto">
        <Flex
          align="center"
          gap={3}
          px={4}
          py={3}
          borderRadius="12px"
          cursor="pointer"
          color="#6F6F6A"
          transition="all 0.2s ease-out"
          onClick={handleLogout}
          _hover={{
            bg: '#FAF7F2',
            color: '#C98A4A',
          }}
        >
          <Icon as={FiLogOut} boxSize={5} />
          <Text fontSize="sm" fontWeight="500">Выйти</Text>
        </Flex>
      </Box>
    </Box>
  )
}
