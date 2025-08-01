import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'

import en from '@/locales/en.json'
import hu from '@/locales/hu.json'

const storedLocale = localStorage.getItem('userLocale') || 'en-GB'

const options: I18nOptions = {
  legacy: false,
  locale: storedLocale,
  fallbackLocale: 'en-GB',
  messages: {
    'en-GB': en,
    'hu-HU': hu
  }
}

const i18n = createI18n(options)

export default i18n
