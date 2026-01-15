import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations, TranslationKey } from '@/lib/i18n';

export type Currency = 'UAH' | 'USD' | 'EUR';

export const currencySymbols: Record<Currency, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€',
};

// Реальні курси валют станом на 2026 рік
export const currencyRates: Record<Currency, number> = {
    UAH: 1,
    USD: 0.024, // ~41.67 UAH за 1 USD
    EUR: 0.022, // ~45.45 UAH за 1 EUR
};

interface SettingsStore {
    language: Language;
    currency: Currency;
    theme: 'light' | 'dark';
    setLanguage: (lang: Language) => void;
    setCurrency: (currency: Currency) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    t: (key: TranslationKey) => string;
    formatPrice: (price: number | string) => string;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            language: 'uk',
            currency: 'UAH',
            theme: 'light',

            setLanguage: language => set({ language }),

            setCurrency: currency => set({ currency }),

            setTheme: theme => {
                set({ theme });
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                }
            },

            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', newTheme === 'dark');
                }
            },

            t: key => {
                const lang = get().language;
                return translations[lang][key] || translations.en[key] || key;
            },

            formatPrice: price => {
                const currency = get().currency;
                const num = typeof price === 'string' ? parseFloat(price) : price;
                const convertedPrice = num * currencyRates[currency];

                return (
                    new Intl.NumberFormat('uk-UA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format(convertedPrice) +
                    ' ' +
                    currencySymbols[currency]
                );
            },
        }),
        {
            name: 'settings-storage',
            onRehydrateStorage: () => state => {
                if (state && typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', state.theme === 'dark');
                }
            },
        },
    ),
);
