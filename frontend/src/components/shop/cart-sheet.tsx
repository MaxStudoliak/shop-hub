'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart.store'
import { useSettingsStore } from '@/stores/settings.store'

interface CartSheetProps {
  children: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, hasHydrated } = useCartStore()
  const { t, formatPrice, hasHydrated: settingsHasHydrated } = useSettingsStore()
  const [open, setOpen] = useState(false)

  const mounted = hasHydrated && settingsHasHydrated

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{mounted ? t('shoppingCartItems') : 'Cart'} ({items.length})</SheetTitle>
          <SheetDescription className="sr-only">
            {mounted ? t('cartDescription') || 'View and manage your shopping cart items' : 'View and manage your shopping cart items'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{mounted ? t('cartEmpty') : 'Cart is empty'}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium line-clamp-2">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>{mounted ? t('total') : 'Total'}</span>
                <span>{mounted ? formatPrice(getTotalPrice()) : getTotalPrice().toFixed(2)}</span>
              </div>
              <SheetFooter>
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/checkout">{mounted ? t('proceedToCheckout') : 'Checkout'}</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
