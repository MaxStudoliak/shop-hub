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
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { t, formatPrice } = useSettingsStore()

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
      title: t('addedToCartMsg'),
      description: `${product.name} ${t('addedToCartDesc')}.`,
    })
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-purple-200 dark:hover:border-purple-800">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
              <span className="text-muted-foreground">{t('noImage')}</span>
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-3 left-3 shadow-lg text-sm px-3 py-1">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600 shadow-lg">
              {t('lowStock')}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute top-3 right-3 shadow-lg">
              {t('outOfStock')}
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">
            {t(`category.${product.category.slug}` as any) || product.category.name}
          </p>
          <h3 className="font-bold text-base line-clamp-2 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('addToCart')}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
