'use client'
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilters } from '@/components/shop/product-filters'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Product, Category, Pagination } from '@/types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSettingsStore } from '@/stores/settings.store'

interface ProductsPageData {
  products: Product[]
  pagination: Pagination
  categories: Category[]
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { t, hasHydrated } = useSettingsStore()
  const [data, setData] = useState<ProductsPageData>({
    products: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    categories: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        const category = searchParams.get('category')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const search = searchParams.get('search')
        const discount = searchParams.get('discount')
        const sort = searchParams.get('sort')
        const order = searchParams.get('order')
        const page = searchParams.get('page')

        if (category) queryParams.set('category', category)
        if (minPrice) queryParams.set('minPrice', minPrice)
        if (maxPrice) queryParams.set('maxPrice', maxPrice)
        if (search) queryParams.set('search', search)
        if (discount) queryParams.set('discount', discount)
        if (sort) queryParams.set('sort', sort)
        if (order) queryParams.set('order', order)
        queryParams.set('page', page || '1')
        queryParams.set('limit', '12')

        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products?${queryParams.toString()}`),
          api.get('/categories'),
        ])

        setData({
          products: productsRes.data.products,
          pagination: productsRes.data.pagination,
          categories: categoriesRes.data,
        })
      } catch {
        setData({
          products: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
          categories: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  const { products, pagination, categories } = data
  const currentPage = pagination.page
  const totalPages = pagination.totalPages
  const search = searchParams.get('search')
  const category = searchParams.get('category')

  return (
    <div className="container py-6 px-4 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Filters Sidebar - Mobile: Collapsible, Desktop: Fixed */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-20">
            <Suspense fallback={<div>{t('loadingFilters')}</div>}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                <h1 className="text-xl md:text-2xl font-bold">
                  {search
                    ? `${t('searchResults')}: "${search}"`
                    : category
                      ? t(`category.${category}` as any) || categories.find((c) => c.slug === category)?.name || t('products')
                      : t('allProducts')}
                </h1>
                <p className="text-muted-foreground">
                  {pagination.total} {pagination.total !== 1 ? t('productsCount') : t('productsCountSingular')}
                </p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{t('noProducts')}</p>
                  <Button asChild variant="outline">
                    <Link href="/products">{t('clearFiltersBtn')}</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-6 md:mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        asChild={currentPage > 1}
                        className="h-9"
                      >
                        {currentPage > 1 ? (
                          <Link
                            href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(currentPage - 1) }).toString()}`}
                          >
                            {t('previous')}
                          </Link>
                        ) : (
                          t('previous')
                        )}
                      </Button>

                      <div className="flex items-center gap-1 md:gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="icon"
                              asChild={currentPage !== pageNum}
                              className="h-9 w-9 hidden sm:flex"
                            >
                              {currentPage !== pageNum ? (
                                <Link
                                  href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(pageNum) }).toString()}`}
                                >
                                  {pageNum}
                                </Link>
                              ) : (
                                <span>{pageNum}</span>
                              )}
                            </Button>
                          )
                        })}
                        {/* Mobile: Show only current page */}
                        <div className="sm:hidden px-3 py-1.5 text-sm">
                          {currentPage} / {totalPages}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        asChild={currentPage < totalPages}
                        className="h-9"
                      >
                        {currentPage < totalPages ? (
                          <Link
                            href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(currentPage + 1) }).toString()}`}
                          >
                            {t('next')}
                          </Link>
                        ) : (
                          t('next')
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
