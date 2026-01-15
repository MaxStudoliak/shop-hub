'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'createdAt'
  const currentOrder = searchParams.get('order') || 'desc'
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <h3 className="font-semibold">Filters</h3>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={currentCategory || 'all'}
          onValueChange={(value) => updateFilters('category', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={`${currentSort}-${currentOrder}`}
          onValueChange={(value) => {
            const [sort, order] = value.split('-')
            const params = new URLSearchParams(searchParams.toString())
            params.set('sort', sort)
            params.set('order', order)
            params.set('page', '1')
            router.push(`/products?${params.toString()}`)
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A-Z</SelectItem>
            <SelectItem value="name-desc">Name: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input
            type="number"
            placeholder="0"
            value={currentMinPrice}
            onChange={(e) => updateFilters('minPrice', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input
            type="number"
            placeholder="999"
            value={currentMaxPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  )
}
