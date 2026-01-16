'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart.store'
import { useSettingsStore } from '@/stores/settings.store'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()
  const { t, formatPrice } = useSettingsStore()

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 100 ? 0 : 10
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container py-12 md:py-16 text-center px-4">
        <ShoppingBag className="mx-auto h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl md:text-2xl font-bold mb-2">{t('cartEmpty')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
          {t('emptyCartDesc')}
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/products">{t('continueShopping')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6 px-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{t('shoppingCart')}</h1>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex gap-3 md:gap-4">
                  <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 80px, 96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2">{item.name}</h3>
                    <p className="text-base md:text-lg font-bold mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm md:text-base">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="font-semibold text-sm md:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/products">{t('continueShopping')}</Link>
            </Button>
            <Button variant="destructive" onClick={clearCart} className="w-full sm:w-auto">
              {t('clearCart')}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">{t('shipping')}</span>
                <span className="font-medium">{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t('freeShippingOver')}
                </p>
              )}
              <Separator />
              <div className="flex justify-between text-base md:text-lg font-bold">
                <span>{t('total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full h-11 md:h-12" size="lg">
                <Link href="/checkout">{t('proceedToCheckout')}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
