import { Suspense } from 'react'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilters } from '@/components/shop/product-filters'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Product, Category, Pagination } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    sort?: string
    order?: string
    page?: string
  }
}

async function getProducts(params: ProductsPageProps['searchParams']) {
  try {
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.set('category', params.category)
    if (params.minPrice) queryParams.set('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.set('maxPrice', params.maxPrice)
    if (params.search) queryParams.set('search', params.search)
    if (params.sort) queryParams.set('sort', params.sort)
    if (params.order) queryParams.set('order', params.order)
    queryParams.set('page', params.page || '1')
    queryParams.set('limit', '12')

    const { data } = await api.get(`/products?${queryParams.toString()}`)
    return data as { products: Product[]; pagination: Pagination }
  } catch {
    return { products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } }
  }
}

async function getCategories() {
  try {
    const { data } = await api.get('/categories')
    return data as Category[]
  } catch {
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [{ products, pagination }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  const currentPage = pagination.page
  const totalPages = pagination.totalPages

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {searchParams.search
                ? `Search: "${searchParams.search}"`
                : searchParams.category
                ? `${categories.find((c) => c.slug === searchParams.category)?.name || 'Products'}`
                : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button asChild variant="outline">
                <Link href="/products">Clear filters</Link>
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
                        href={{
                          pathname: '/products',
                          query: { ...searchParams, page: currentPage - 1 },
                        }}
                      >
                        Previous
                      </Link>
                    ) : (
                      'Previous'
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
                              href={{
                                pathname: '/products',
                                query: { ...searchParams, page: pageNum },
                              }}
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
                        href={{
                          pathname: '/products',
                          query: { ...searchParams, page: currentPage + 1 },
                        }}
                      >
                        Next
                      </Link>
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
