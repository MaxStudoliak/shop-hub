'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Package, Heart, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUserStore } from '@/stores/user.store'
import { userApi } from '@/lib/user-api'
import { Order, Pagination } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings.store'

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useUserStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useSettingsStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, router])

  const fetchOrders = async (page = 1) => {
    try {
      const { data } = await userApi.get(`/user/orders?page=${page}`)
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
    PENDING: 'warning',
    PROCESSING: 'default',
    SHIPPED: 'secondary',
    DELIVERED: 'success',
    CANCELLED: 'destructive',
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('myAccount')}</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  {t('profile')}
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 p-2 rounded-md bg-muted"
                >
                  <Package className="h-4 w-4" />
                  {t('orders')}
                </Link>
                <Link
                  href="/account/favorites"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                >
                  <Heart className="h-4 w-4" />
                  {t('favorites')}
                </Link>
                <Separator className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted w-full text-left text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('orderHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">{t('loading')}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">{t('noOrdersYet')}</p>
                  <Button asChild>
                    <Link href="/products">{t('startShopping')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusColors[order.status]}>
                            {order.status}
                          </Badge>
                          <p className="font-semibold mt-1">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden"
                          >
                            {item.product?.images?.[0] ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.productName}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center text-sm">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </p>
                        <Link
                          href={`/checkout/success?orderId=${order.id}`}
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchOrders(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchOrders(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
