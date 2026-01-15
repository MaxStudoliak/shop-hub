'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user.store'
import { userApi } from '@/lib/user-api'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  productId: string
  className?: string
  variant?: 'icon' | 'button'
}

export function FavoriteButton({ productId, className, variant = 'icon' }: FavoriteButtonProps) {
  const { isAuthenticated } = useUserStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      checkFavorite()
    }
  }, [productId, isAuthenticated])

  const checkFavorite = async () => {
    try {
      const { data } = await userApi.get(`/favorites/check/${productId}`)
      setIsFavorite(data.isFavorite)
    } catch {
      // Ignore
    }
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated()) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to add favorites',
      })
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        await userApi.delete(`/favorites/${productId}`)
        setIsFavorite(false)
        toast({ title: 'Removed from favorites' })
      } else {
        await userApi.post(`/favorites/${productId}`)
        setIsFavorite(true)
        toast({ title: 'Added to favorites' })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        onClick={toggleFavorite}
        disabled={loading}
        className={className}
      >
        <Heart
          className={cn('h-4 w-4 mr-2', isFavorite && 'fill-red-500 text-red-500')}
        />
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={className}
    >
      <Heart
        className={cn('h-5 w-5', isFavorite && 'fill-red-500 text-red-500')}
      />
    </Button>
  )
}
