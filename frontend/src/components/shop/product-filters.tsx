'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Category } from '@/types'
import { useSettingsStore } from '@/stores/settings.store'
import { Checkbox } from '@/components/ui/checkbox'

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useSettingsStore()

  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'createdAt'
  const currentOrder = searchParams.get('order') || 'desc'
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentDiscount = searchParams.get('discount') === 'true'

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
    <div className="space-y-4">
      {/* Mobile: Collapsible Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              {t('filters')}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('filters')}</SheetTitle>
              <SheetDescription className="sr-only">
                Filter products by category, price, and other criteria
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <FilterContent
                categories={categories}
                currentCategory={currentCategory}
                currentSort={currentSort}
                currentOrder={currentOrder}
                currentMinPrice={currentMinPrice}
                currentMaxPrice={currentMaxPrice}
                currentDiscount={currentDiscount}
                updateFilters={updateFilters}
                clearFilters={clearFilters}
                t={t}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Always Visible Filters */}
      <div className="hidden lg:block p-4 border rounded-lg bg-background">
        <FilterContent
          categories={categories}
          currentCategory={currentCategory}
          currentSort={currentSort}
          currentOrder={currentOrder}
          currentMinPrice={currentMinPrice}
          currentMaxPrice={currentMaxPrice}
          currentDiscount={currentDiscount}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          t={t}
        />
      </div>
    </div>
  )
}

function FilterContent({
  categories,
  currentCategory,
  currentSort,
  currentOrder,
  currentMinPrice,
  currentMaxPrice,
  currentDiscount,
  updateFilters,
  clearFilters,
  t,
}: {
  categories: Category[]
  currentCategory: string
  currentSort: string
  currentOrder: string
  currentMinPrice: string
  currentMaxPrice: string
  currentDiscount: boolean
  updateFilters: (key: string, value: string) => void
  clearFilters: () => void
  t: any
}) {
  return (
    <div className="space-y-4 p-4 lg:p-0">
      <h3 className="font-semibold text-base lg:hidden">{t('filters')}</h3>

      <div className="space-y-2">
        <Label>{t('category')}</Label>
        <Select
          value={currentCategory || 'all'}
          onValueChange={(value) => updateFilters('category', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {t(`category.${category.slug}` as any) || category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('sortBy')}</Label>
        <Select
          value={`${currentSort}-${currentOrder}`}
          onValueChange={(value) => {
            const [sort, order] = value.split('-')
            updateFilters('sort', sort)
            updateFilters('order', order)
          }}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">{t('newestFirst')}</SelectItem>
            <SelectItem value="createdAt-asc">{t('oldestFirst')}</SelectItem>
            <SelectItem value="price-asc">{t('priceLowHigh')}</SelectItem>
            <SelectItem value="price-desc">{t('priceHighLow')}</SelectItem>
            <SelectItem value="name-asc">{t('nameAZ')}</SelectItem>
            <SelectItem value="name-desc">{t('nameZA')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors">
        <Checkbox
          id="discount"
          checked={currentDiscount}
          onCheckedChange={(checked) => updateFilters('discount', checked ? 'true' : '')}
          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
        />
        <label
          htmlFor="discount"
          className="text-sm font-medium leading-none cursor-pointer flex-1 select-none"
        >
          {t('showOnlyDiscounts')}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>{t('minPrice')}</Label>
          <Input
            type="number"
            placeholder="0"
            value={currentMinPrice}
            onChange={(e) => updateFilters('minPrice', e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('maxPrice')}</Label>
          <Input
            type="number"
            placeholder="999"
            value={currentMaxPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <Button variant="outline" className="w-full h-10" onClick={clearFilters}>
        {t('clearFilters')}
      </Button>
    </div>
  )
}
