'use client'

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
  const { t } = useSettingsStore()
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
        const sort = searchParams.get('sort')
        const order = searchParams.get('order')
        const page = searchParams.get('page')

        if (category) queryParams.set('category', category)
        if (minPrice) queryParams.set('minPrice', minPrice)
        if (maxPrice) queryParams.set('maxPrice', maxPrice)
        if (search) queryParams.set('search', search)
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
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Suspense fallback={<div>{t('loadingFilters')}</div>}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        disabled={currentPage <= 1}
                        asChild={currentPage > 1}
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

                      <div className="flex items-center gap-2">
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
                      </div>

                      <Button
                        variant="outline"
                        disabled={currentPage >= totalPages}
                        asChild={currentPage < totalPages}
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
