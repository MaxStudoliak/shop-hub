'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart.store'
import { toast } from '@/hooks/use-toast'
import { FavoriteButton } from '@/components/shop/favorite-button'
import { ProductReviews } from '@/components/shop/product-reviews'
import { useSettingsStore } from '@/stores/settings.store'

interface ProductPageProps {
  params: { slug: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { t, language } = useSettingsStore()

  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await api.get(`/products/${params.slug}`)
        setProduct(data)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/4 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('productNotFound')}</h1>
        <Button asChild>
          <Link href="/products">{t('backToProducts')}</Link>
        </Button>
      </div>
    )
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const comparePrice = product.comparePrice
    ? typeof product.comparePrice === 'string'
      ? parseFloat(product.comparePrice)
      : product.comparePrice
    : null

  const hasDiscount = comparePrice && comparePrice > price
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price,
        image: product.images[0]?.url || '/placeholder.png',
        stock: product.stock,
      })
    }
    toast({
      title: t('addedToCartMsg'),
      description: `${quantity}x ${product.name} ${t('addedToCartDesc')}.`,
    })
  }

  return (
    <div className="container py-6 px-4 md:py-8">
      <Button variant="ghost" asChild className="mb-6 md:mb-8 -ml-2">
        <Link href="/products">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('backToProducts')}
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3 md:space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">{t('noImage')}</span>
              </div>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                -{discountPercent}%
              </Badge>
            )}
            <FavoriteButton
              productId={product.id}
              className="absolute top-4 right-4 bg-background/80 hover:bg-background"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, idx) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t(`category.${product.category.slug}` as any) || product.category.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-3xl font-bold">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">{t('description')}</h3>
            <p className="text-muted-foreground">
              {language === 'uk' && (product as any).descriptionUk
                ? (product as any).descriptionUk
                : language === 'ru' && (product as any).descriptionRu
                  ? (product as any).descriptionRu
                  : product.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold">{t('availability')}:</span>
            {product.stock > 0 ? (
              <Badge variant="success">{t('inStock')} ({product.stock} {t('available')})</Badge>
            ) : (
              <Badge variant="secondary">{t('outOfStock')}</Badge>
            )}
          </div>

          {product.sku && (
            <div className="flex items-center gap-4">
              <span className="font-semibold">{t('sku')}:</span>
              <span className="text-muted-foreground">{product.sku}</span>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="font-semibold">{t('quantity')}:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="h-12 md:h-14 text-base md:text-lg font-semibold sm:flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                {t('addToCart')}
              </Button>
              <FavoriteButton productId={product.id} variant="button" className="h-12 md:h-14 sm:w-12 md:sm:w-14" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={product.id} />
    </div>
  )
}
