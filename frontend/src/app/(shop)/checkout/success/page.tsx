'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get(`/orders/${orderId}`)
        setOrder(data)
      } catch {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-8 w-64 bg-muted rounded mx-auto mb-2" />
          <div className="h-6 w-48 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-16 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
        <p className="text-muted-foreground">
          We&apos;ve received your order and will send you a confirmation email shortly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Number</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{order.status.toLowerCase()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-muted-foreground">
              {order.customerName}
              <br />
              {order.shippingAddress}
              <br />
              {order.shippingCity}, {order.shippingZip}
              <br />
              {order.shippingCountry}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {Number(order.shippingCost) === 0
                  ? 'Free'
                  : formatPrice(order.shippingCost)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
