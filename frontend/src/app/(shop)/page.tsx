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
  const { t, hasHydrated } = useSettingsStore()

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

    if (hasHydrated) {
      fetchData()
    }
  }, [hasHydrated])

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container relative py-8 px-3 sm:py-12 sm:px-4 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight">
              {hasHydrated ? t('heroTitle') : 'Discover the Best Products for You'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150 px-4">
              {hasHydrated ? t('heroSubtitleExtended') : 'Find everything you need in one place'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-2.5 sm:gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 px-4">
              <Button asChild size="default" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
                <Link href="/products">{hasHydrated ? t('shopNow') : 'Shop Now'}</Link>
              </Button>
              <Button asChild size="default" className="bg-purple-900 text-white hover:bg-purple-800 shadow-lg hover:shadow-xl transition-all border-2 border-white/20 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
                <Link href="/products?discount=true">{hasHydrated ? t('discounts') : 'Deals & Discounts'}</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 md:h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Categories Section */}
      <section className="container py-8 px-3 sm:py-12 sm:px-4 md:py-16 lg:py-24">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {hasHydrated ? t('shopByCategory') : 'Shop by Category'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={hasHydrated ? (t(`category.${category.slug}` as any) || category.name) : category.name}
                  fill
                  sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
                  priority={categories.indexOf(category) === 0}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <h3 className="text-white text-xs sm:text-sm md:text-base lg:text-xl font-bold p-2 sm:p-3 md:p-4 transform transition-transform group-hover:translate-y-0 translate-y-2">
                  {hasHydrated ? (t(`category.${category.slug}` as any) || category.name) : category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background py-8 px-3 sm:py-12 sm:px-4 md:py-16 lg:py-24">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 md:mb-12 gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {hasHydrated ? t('featuredProducts') : 'Featured Products'}
            </h2>
            <Button asChild variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all w-full sm:w-auto text-sm">
              <Link href="/products">{hasHydrated ? t('viewAll') : 'View All'}</Link>
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12 md:py-16">
              <div className="inline-block w-10 h-10 md:w-12 md:h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 min-[480px]:gap-3 md:gap-4 lg:gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-8 px-3 sm:py-12 sm:px-4 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          <div className="text-center group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
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
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 md:mb-3">{hasHydrated ? t('qualityProducts') : 'Quality Products'}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {hasHydrated ? t('qualityProductsDesc') : 'Only the best products from trusted suppliers'}
            </p>
          </div>
          <div className="text-center group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
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
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 md:mb-3">{hasHydrated ? t('bestPrices') : 'Best Prices'}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {hasHydrated ? t('bestPricesDesc') : 'Competitive prices and great discounts'}
            </p>
          </div>
          <div className="text-center group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white"
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
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 md:mb-3">{hasHydrated ? t('fastShipping') : 'Fast Shipping'}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {hasHydrated ? t('fastShippingDesc') : 'Fast and reliable delivery to your door'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
