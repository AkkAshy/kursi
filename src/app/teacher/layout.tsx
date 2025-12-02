'use client'

import { Box, Flex } from '@chakra-ui/react'
import { TeacherSidebar } from '@/components/layout/TeacherSidebar'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Flex minH="100vh" bg="#FAF7F2">
      <TeacherSidebar />
      <Box
        as="main"
        ml="260px"
        flex={1}
        p={8}
        minH="100vh"
      >
        {children}
      </Box>
    </Flex>
  )
}
