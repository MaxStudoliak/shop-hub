'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/shop/product-card'
import { useUserStore } from '@/stores/user.store'
import { userApi } from '@/lib/user-api'
import { Product } from '@/types'

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useUserStore()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchFavorites()
  }, [isAuthenticated, router])

  const fetchFavorites = async () => {
    try {
      const { data } = await userApi.get('/favorites')
      setFavorites(data)
    } catch {
      console.error('Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

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
                  Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  href="/account/favorites"
                  className="flex items-center gap-2 p-2 rounded-md bg-muted"
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
                <Separator className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted w-full text-left text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>My Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No favorites yet</p>
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
