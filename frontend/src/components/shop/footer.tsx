'use client'

import Link from 'next/link'
import { useSettingsStore } from '@/stores/settings.store'

export function Footer() {
  const { t } = useSettingsStore()
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop-Hub</h3>
            <p className="text-sm text-muted-foreground">
              {t('oneStopShop')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics" className="hover:text-foreground">
                  {t('electronics')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing" className="hover:text-foreground">
                  {t('clothing')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('contactUs')}</li>
              <li>{t('faqs')}</li>
              <li>{t('shippingInfoFooter')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('privacyPolicy')}</li>
              <li>{t('termsOfService')}</li>
              <li>{t('returnsPolicy')}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shop-Hub. {t('allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  )
}
