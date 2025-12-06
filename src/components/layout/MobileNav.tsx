'use client'

import { useState } from 'react'
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  HStack,
  Avatar,
  IconButton,
} from '@chakra-ui/react'
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface MobileNavProps {
  navItems: NavItem[]
  brandName?: string
  userRole?: string
}

export function MobileNav({ navItems, brandName = 'Kursi', userRole = 'Пользователь' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
    setIsOpen(false)
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Mobile Header */}
      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="white"
        borderBottom="1px solid"
        borderColor="#EFE8E0"
        px={4}
        py={3}
      >
        <Flex justify="space-between" align="center">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="#4C8F6D"
            letterSpacing="-0.5px"
          >
            {brandName}
          </Text>
          <IconButton
            aria-label="Menu"
            variant="ghost"
            size="md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon as={isOpen ? FiX : FiMenu} boxSize={6} color="#3E3E3C" />
          </IconButton>
        </Flex>
      </Box>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.500"
          zIndex={150}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="280px"
        bg="white"
        zIndex={200}
        transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
        transition="transform 0.3s ease-out"
        boxShadow={isOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'}
      >
        <Flex direction="column" h="full" py={6}>
          {/* Logo */}
          <Flex justify="space-between" align="center" px={6} mb={6}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="#4C8F6D"
              letterSpacing="-0.5px"
            >
              {brandName}
            </Text>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <Icon as={FiX} boxSize={5} color="#6F6F6A" />
            </IconButton>
          </Flex>

          {/* User Info */}
          <Box px={6} mb={6}>
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
                  {userRole}
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Navigation */}
          <VStack gap={1} px={3} flex={1}>
            {navItems.map((item) => {
              const baseHref = navItems[0]?.href?.split('/')[1] || ''
              const isActive = pathname === item.href ||
                (item.href !== `/${baseHref}` && pathname?.startsWith(item.href))

              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  style={{ width: '100%' }}
                  onClick={() => setIsOpen(false)}
                >
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
                    position="relative"
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
        </Flex>
      </Box>
    </>
  )
}
