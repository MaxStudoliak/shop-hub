'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { api } from '@/lib/api'
import { Product, Category } from '@/types'
import { useSettingsStore } from '@/stores/settings.store'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useSettingsStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories'),
        ])
        setProducts(productsRes.data.products)
        setCategories(categoriesRes.data)
      } catch {
        console.error('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              {t('heroSubtitleExtended')}
            </p>
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                <Link href="/products">{t('shopNow')}</Link>
              </Button>
              <Button asChild size="lg" className="bg-purple-900 text-white hover:bg-purple-800 shadow-lg hover:shadow-xl transition-all border-2 border-white/20">
                <Link href="/products?sort=popular">{t('popularProducts')}</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Categories Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('shopByCategory')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={t(`category.${category.slug}` as any) || category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <h3 className="text-white text-lg md:text-xl font-bold p-4 transform transition-transform group-hover:translate-y-0 translate-y-2">
                  {t(`category.${category.slug}` as any) || category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('featuredProducts')}
            </h2>
            <Button asChild variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
              <Link href="/products">{t('viewAll')}</Link>
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t('qualityProducts')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('qualityProductsDesc')}
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t('bestPrices')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('bestPricesDesc')}
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">{t('fastShipping')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('fastShippingDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
