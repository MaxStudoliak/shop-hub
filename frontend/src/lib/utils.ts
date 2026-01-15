import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Deprecated: Use useSettingsStore().formatPrice() instead
export function formatPrice(price: number | string): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return (
        new Intl.NumberFormat('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num) + ' ₴'
    );
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}
