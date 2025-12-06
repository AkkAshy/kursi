'use client'

import { Box, SimpleGrid, VStack, HStack, Flex, Card } from '@chakra-ui/react'

// Course card skeleton
export function CourseCardSkeleton() {
  return (
    <Card.Root
      bg="white"
      borderRadius="20px"
      boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
      border="1px solid"
      borderColor="#EFE8E0"
      overflow="hidden"
    >
      {/* Cover skeleton */}
      <Box
        h="180px"
        bg="linear-gradient(90deg, #EFE8E0 0%, #F5F0EA 50%, #EFE8E0 100%)"
        backgroundSize="200% 100%"
        animation="shimmer 1.5s ease-in-out infinite"
        css={{
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        }}
      />

      <Card.Body p={5}>
        <VStack align="stretch" gap={4}>
          {/* Title skeleton */}
          <Box>
            <Box
              h="20px"
              bg="#EFE8E0"
              borderRadius="8px"
              w="85%"
              mb={2}
              animation="pulse 1.5s ease-in-out infinite"
              css={{
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
            <Box
              h="16px"
              bg="#EFE8E0"
              borderRadius="6px"
              w="60%"
              animation="pulse 1.5s ease-in-out infinite"
            />
          </Box>

          {/* Stats skeleton */}
          <HStack gap={4}>
            <Box h="16px" bg="#EFE8E0" borderRadius="6px" w="60px" animation="pulse 1.5s ease-in-out infinite" />
            <Box h="16px" bg="#EFE8E0" borderRadius="6px" w="40px" animation="pulse 1.5s ease-in-out infinite" />
          </HStack>

          {/* Price skeleton */}
          <Flex
            justify="space-between"
            align="center"
            pt={3}
            borderTop="1px solid"
            borderColor="#EFE8E0"
          >
            <Box h="24px" bg="#EFE8E0" borderRadius="8px" w="100px" animation="pulse 1.5s ease-in-out infinite" />
            <Box h="28px" bg="#EFE8E0" borderRadius="full" w="80px" animation="pulse 1.5s ease-in-out infinite" />
          </Flex>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

// Course grid skeleton
export function CoursesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  )
}

// Lesson card skeleton
export function LessonCardSkeleton() {
  return (
    <Card.Root
      bg="white"
      borderRadius="16px"
      boxShadow="0 2px 8px -4px rgba(0,0,0,0.04)"
      border="1px solid"
      borderColor="#EFE8E0"
    >
      <Card.Body p={5}>
        <Flex justify="space-between" align="center">
          <HStack gap={4}>
            {/* Number skeleton */}
            <Box
              w={10}
              h={10}
              bg="#EFE8E0"
              borderRadius="12px"
              animation="pulse 1.5s ease-in-out infinite"
            />
            <VStack align="start" gap={2}>
              {/* Title */}
              <Box
                h="18px"
                bg="#EFE8E0"
                borderRadius="6px"
                w="180px"
                animation="pulse 1.5s ease-in-out infinite"
              />
              {/* Description */}
              <Box
                h="14px"
                bg="#EFE8E0"
                borderRadius="4px"
                w="120px"
                animation="pulse 1.5s ease-in-out infinite"
              />
            </VStack>
          </HStack>
          {/* Badge skeleton */}
          <Box
            h="28px"
            bg="#EFE8E0"
            borderRadius="full"
            w="70px"
            animation="pulse 1.5s ease-in-out infinite"
          />
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

// Lessons list skeleton
export function LessonsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <VStack gap={3} align="stretch">
      {Array.from({ length: count }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </VStack>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <Card.Root
      bg="white"
      borderRadius="20px"
      boxShadow="0 2px 12px -4px rgba(0,0,0,0.06)"
      border="1px solid"
      borderColor="#EFE8E0"
    >
      <Card.Body p={6}>
        <VStack align="start" gap={3}>
          <Box
            h="14px"
            bg="#EFE8E0"
            borderRadius="4px"
            w="80px"
            animation="pulse 1.5s ease-in-out infinite"
          />
          <Box
            h="32px"
            bg="#EFE8E0"
            borderRadius="8px"
            w="100px"
            animation="pulse 1.5s ease-in-out infinite"
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <Flex gap={4} p={4} borderBottom="1px solid" borderColor="#EFE8E0">
      {Array.from({ length: columns }).map((_, i) => (
        <Box
          key={i}
          h="16px"
          bg="#EFE8E0"
          borderRadius="4px"
          flex={1}
          animation="pulse 1.5s ease-in-out infinite"
        />
      ))}
    </Flex>
  )
}

// Page header skeleton
export function PageHeaderSkeleton() {
  return (
    <VStack align="start" gap={2} mb={8}>
      <Box
        h="32px"
        bg="#EFE8E0"
        borderRadius="8px"
        w="250px"
        animation="pulse 1.5s ease-in-out infinite"
      />
      <Box
        h="18px"
        bg="#EFE8E0"
        borderRadius="6px"
        w="180px"
        animation="pulse 1.5s ease-in-out infinite"
      />
    </VStack>
  )
}
