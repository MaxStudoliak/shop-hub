import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language, translations, TranslationKey } from '@/lib/i18n'

interface SettingsStore {
  language: Language
  theme: 'light' | 'dark'
  setLanguage: (lang: Language) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  t: (key: TranslationKey) => string
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      language: 'uk',
      theme: 'light',

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
      },

      t: (key) => {
        const lang = get().language
        return translations[lang][key] || translations.en[key] || key
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
