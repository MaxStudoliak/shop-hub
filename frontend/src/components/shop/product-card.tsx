'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart.store'
import { toast } from '@/hooks/use-toast'
import { useSettingsStore } from '@/stores/settings.store'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { t } = useSettingsStore()

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
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">{t('noImage')}</span>
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="warning" className="absolute top-2 right-2">
              {t('lowStock')}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {t('outOfStock')}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t(`category.${product.category.slug}` as any) || product.category.name}</p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
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
