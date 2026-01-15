'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Package, Heart, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useUserStore } from '@/stores/user.store'
import { userApi } from '@/lib/user-api'
import { toast } from '@/hooks/use-toast'

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useUserStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        zip: user.zip || '',
        country: user.country || '',
      })
    }
  }, [isAuthenticated, user, router, reset])

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    try {
      const response = await userApi.put('/auth/profile', data)
      updateUser(response.data)
      toast({ title: 'Profile updated successfully!' })
    } catch {
      toast({
        title: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
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
                  className="flex items-center gap-2 p-2 rounded-md bg-muted"
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
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
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
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} placeholder="+1 234 567 8900" />
                </div>

                <Separator />

                <h3 className="font-semibold">Shipping Address</h3>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} placeholder="123 Main St" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" {...register('zip')} placeholder="10001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('country')} placeholder="United States" />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
