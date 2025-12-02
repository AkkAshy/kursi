import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const customConfig = defineConfig({
  globalCss: {
    'html, body': {
      bg: '#FAF7F2',
      color: '#3F2C24',
      lineHeight: 1.6,
    },
    '*::selection': {
      bg: '#C5E6D5',
      color: '#183B2A',
    },
  },
  theme: {
    tokens: {
      colors: {
        // База (фон)
        cream: {
          50: { value: '#FAF7F2' },
          100: { value: '#F3ECE5' },
          200: { value: '#EFE8E0' },
          300: { value: '#E5DCD2' },
          400: { value: '#D9CFC3' },
          500: { value: '#C9BDB0' },
          600: { value: '#B5A797' },
          700: { value: '#9A8B7A' },
          800: { value: '#7A6D5E' },
          900: { value: '#5A5044' },
        },
        // Акцент - тёплый зелёный
        brand: {
          50: { value: '#E8F5EE' },
          100: { value: '#C5E6D5' },
          200: { value: '#9FD6BA' },
          300: { value: '#79C69F' },
          400: { value: '#5CB885' },
          500: { value: '#4C8F6D' },
          600: { value: '#3F7A5C' },
          700: { value: '#32654B' },
          800: { value: '#25503A' },
          900: { value: '#183B2A' },
        },
        // Альтернативный акцент - коньячный/янтарный
        amber: {
          50: { value: '#FDF6ED' },
          100: { value: '#F9E8D3' },
          200: { value: '#F4D6B3' },
          300: { value: '#EEC493' },
          400: { value: '#E5AD6D' },
          500: { value: '#C98A4A' },
          600: { value: '#A87139' },
          700: { value: '#875A2D' },
          800: { value: '#664422' },
          900: { value: '#452E17' },
        },
        // Светлый оливковый
        olive: {
          50: { value: '#F4F7F4' },
          100: { value: '#E8EFE8' },
          200: { value: '#DDE8DD' },
          300: { value: '#C5D9C5' },
          400: { value: '#A9C7A9' },
          500: { value: '#8BB58B' },
          600: { value: '#6DA06D' },
          700: { value: '#558855' },
          800: { value: '#3F6B3F' },
          900: { value: '#2A4D2A' },
        },
        // Тёплый коричневый
        brown: {
          50: { value: '#F7F3F1' },
          100: { value: '#EBE3DE' },
          200: { value: '#DDD1C9' },
          300: { value: '#C9B8AD' },
          400: { value: '#B39D8E' },
          500: { value: '#6C4E3F' },
          600: { value: '#5D4236' },
          700: { value: '#4E372D' },
          800: { value: '#3F2C24' },
          900: { value: '#30211B' },
        },
      },
      fonts: {
        heading: { value: `'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
        body: { value: `'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
      },
      radii: {
        sm: { value: '6px' },
        md: { value: '10px' },
        lg: { value: '12px' },
        xl: { value: '14px' },
        '2xl': { value: '16px' },
        '3xl': { value: '20px' },
      },
      shadows: {
        xs: { value: '0 1px 2px 0 rgba(107, 78, 63, 0.04)' },
        sm: { value: '0 2px 4px 0 rgba(107, 78, 63, 0.06)' },
        md: { value: '0 4px 8px -2px rgba(107, 78, 63, 0.08)' },
        lg: { value: '0 6px 14px -4px rgba(107, 78, 63, 0.10)' },
        xl: { value: '0 10px 20px -6px rgba(107, 78, 63, 0.12)' },
        card: { value: '0 4px 14px -4px rgba(107, 78, 63, 0.10)' },
        button: { value: '0 2px 8px -2px rgba(76, 143, 109, 0.20)' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
