'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cart.store'
import { toast } from '@/hooks/use-toast'
import { useSettingsStore } from '@/stores/settings.store'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { t, formatPrice, hasHydrated } = useSettingsStore()

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      price,
      image: product.images[0]?.url || '/placeholder.png',
      stock: product.stock,
    })
    toast({
      title: hasHydrated ? t('addedToCartMsg') : 'Added to cart',
      description: `${product.name} ${hasHydrated ? t('addedToCartDesc') : 'added to cart'}.`,
    })
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-purple-200 dark:hover:border-purple-800">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
              <span className="text-muted-foreground text-xs sm:text-sm">{hasHydrated ? t('noImage') : 'No image'}</span>
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 left-2 shadow-lg text-xs px-2 py-0.5 sm:text-sm sm:px-3 sm:py-1">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 shadow-lg text-xs px-2 py-0.5">
              {hasHydrated ? t('lowStock') : 'Low stock'}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2 shadow-lg text-xs px-2 py-0.5">
              {hasHydrated ? t('outOfStock') : 'Out of stock'}
            </Badge>
          )}
        </div>
        <CardContent className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">
              {hasHydrated ? (t(`category.${product.category.slug}` as any) || product.category.name) : product.category.name}
            </p>
            <h3 className="font-bold text-xs sm:text-sm md:text-base line-clamp-2 min-h-[2rem] sm:min-h-[2.3rem] md:min-h-[2.5rem] mb-1.5 sm:mb-2 md:mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              {hasHydrated ? formatPrice(price) : `${price.toFixed(2)} ₴`}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through">
                {hasHydrated ? formatPrice(comparePrice) : `${comparePrice.toFixed(2)} ₴`}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-2.5 sm:p-3 md:p-4 pt-0">
          <Button
            className="w-full h-8 sm:h-9 md:h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all text-[11px] sm:text-xs md:text-sm px-2 sm:px-3 whitespace-nowrap"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{hasHydrated ? t('addToCart') : 'Add to cart'}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
