import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { api } from '@/lib/api'
import { Product, Category } from '@/types'

async function getFeaturedProducts() {
  try {
    const { data } = await api.get('/products?limit=8')
    return data.products as Product[]
  } catch {
    return []
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

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Shop-Hub
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Discover amazing products at unbeatable prices. Quality, style, and
              convenience all in one place.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products?sort=createdAt&order=desc">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container py-16 bg-muted/50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Button asChild variant="outline">
            <Link href="/products">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
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
            <h3 className="text-lg font-semibold mb-2">Quality Products</h3>
            <p className="text-muted-foreground">
              We source only the best products from trusted suppliers.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
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
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-muted-foreground">
              Competitive prices and regular discounts on all products.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
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
            <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
            <p className="text-muted-foreground">
              Free shipping on orders over $100. Quick delivery guaranteed.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
