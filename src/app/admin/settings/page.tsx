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
  Card,
  Spinner,
  Input,
  Textarea,
  Button,
} from '@chakra-ui/react'
import {
  FiCreditCard,
  FiPhone,
  FiSave,
  FiCheck,
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import api from '@/lib/api'

interface PaymentSettings {
  card_number: string
  card_holder_name: string
  manager_phone: string
  manager_telegram: string
  instructions: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    card_number: '',
    card_holder_name: '',
    manager_phone: '',
    manager_telegram: '',
    instructions: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await api.getAdminPaymentSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.updateAdminPaymentSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="#C98A4A" />
      </Flex>
    )
  }

  return (
    <Box maxW="800px">
      {/* Header */}
      <Box mb={8}>
        <Heading
          as="h1"
          fontSize="28px"
          fontWeight="bold"
          color="#3E3E3C"
          letterSpacing="-0.5px"
          mb={2}
        >
          Настройки
        </Heading>
        <Text color="#6F6F6A" fontSize="15px">
          Настройки платежей платформы
        </Text>
      </Box>

      {/* Payment Settings Card */}
      <Card.Root
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="#EFE8E0"
      >
        <Card.Body p={6}>
          <VStack gap={6} align="stretch">
            <Heading as="h3" fontSize="18px" color="#3E3E3C">
              Реквизиты для оплаты
            </Heading>

            {/* Card Number */}
            <Box>
              <Text fontSize="13px" color="#6F6F6A" mb={2}>
                Номер карты
              </Text>
              <HStack>
                <Icon as={FiCreditCard} color="#6F6F6A" />
                <Input
                  value={settings.card_number}
                  onChange={(e) => setSettings({ ...settings, card_number: e.target.value })}
                  placeholder="8600 0000 0000 0000"
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  _focus={{
                    borderColor: '#C98A4A',
                    boxShadow: '0 0 0 1px #C98A4A',
                  }}
                />
              </HStack>
            </Box>

            {/* Card Holder Name */}
            <Box>
              <Text fontSize="13px" color="#6F6F6A" mb={2}>
                Имя владельца карты
              </Text>
              <Input
                value={settings.card_holder_name}
                onChange={(e) => setSettings({ ...settings, card_holder_name: e.target.value })}
                placeholder="IVAN IVANOV"
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                _focus={{
                  borderColor: '#C98A4A',
                  boxShadow: '0 0 0 1px #C98A4A',
                }}
              />
            </Box>

            {/* Manager Phone */}
            <Box>
              <Text fontSize="13px" color="#6F6F6A" mb={2}>
                Телефон менеджера
              </Text>
              <HStack>
                <Icon as={FiPhone} color="#6F6F6A" />
                <Input
                  value={settings.manager_phone}
                  onChange={(e) => setSettings({ ...settings, manager_phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  _focus={{
                    borderColor: '#C98A4A',
                    boxShadow: '0 0 0 1px #C98A4A',
                  }}
                />
              </HStack>
            </Box>

            {/* Manager Telegram */}
            <Box>
              <Text fontSize="13px" color="#6F6F6A" mb={2}>
                Telegram менеджера
              </Text>
              <HStack>
                <Icon as={FaTelegram} color="#6F6F6A" />
                <Input
                  value={settings.manager_telegram}
                  onChange={(e) => setSettings({ ...settings, manager_telegram: e.target.value })}
                  placeholder="username (без @)"
                  bg="#FDFBF8"
                  border="1px solid"
                  borderColor="#EFE8E0"
                  borderRadius="12px"
                  _focus={{
                    borderColor: '#C98A4A',
                    boxShadow: '0 0 0 1px #C98A4A',
                  }}
                />
              </HStack>
            </Box>

            {/* Instructions */}
            <Box>
              <Text fontSize="13px" color="#6F6F6A" mb={2}>
                Инструкции по оплате
              </Text>
              <Textarea
                value={settings.instructions}
                onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                placeholder="Переведите сумму на указанную карту и загрузите скриншот подтверждения..."
                rows={4}
                bg="#FDFBF8"
                border="1px solid"
                borderColor="#EFE8E0"
                borderRadius="12px"
                _focus={{
                  borderColor: '#C98A4A',
                  boxShadow: '0 0 0 1px #C98A4A',
                }}
              />
            </Box>

            {/* Save Button */}
            <Button
              bg={saved ? '#4C8F6D' : '#C98A4A'}
              color="white"
              borderRadius="12px"
              size="lg"
              onClick={handleSave}
              loading={isSaving}
              _hover={{
                bg: saved ? '#3F7A5C' : '#B57A3A',
              }}
            >
              <Icon as={saved ? FiCheck : FiSave} mr={2} />
              {saved ? 'Сохранено!' : 'Сохранить'}
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
