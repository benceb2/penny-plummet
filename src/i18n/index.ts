import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'

import en from '@/locales/en.json' assert { type: 'json' }
import hu from '@/locales/hu.json' assert { type: 'json' }

const options: I18nOptions = {
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en,
    'hu-HU': hu
  }
}

export default createI18n(options)
