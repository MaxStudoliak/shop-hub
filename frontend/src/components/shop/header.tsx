'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, Heart, Moon, Sun, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartStore } from '@/stores/cart.store'
import { useUserStore } from '@/stores/user.store'
import { useSettingsStore, Currency, currencySymbols } from '@/stores/settings.store'
import { CartSheet } from './cart-sheet'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { languages, Language } from '@/lib/i18n'

const categories = [
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'clothing', name: 'Clothing' },
  { slug: 'home-garden', name: 'Home & Garden' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'books', name: 'Books' },
  { slug: 'toys', name: 'Toys' },
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'automotive', name: 'Automotive' },
]

export function Header() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const { user, isAuthenticated, logout } = useUserStore()
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency, t } = useSettingsStore()
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Shop-Hub</span>
          </Link>
          <nav className="hidden lg:flex gap-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-white">
                  {mounted ? t('allProducts') : 'All Products'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/products">
                    {mounted ? t('allProducts') : 'All Products'}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-white">
                  {mounted ? t('category') : 'Categories'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/products?category=${cat.slug}`}>
                      {mounted ? (t(`category.${cat.slug}` as any) || cat.name) : cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={mounted ? t('searchPlaceholder') : 'Search...'}
                className="w-48 lg:w-64 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(languages) as Language[]).map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? 'bg-accent' : ''}
                >
                  {languages[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Currency Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {mounted ? currencySymbols[currency] : '₴'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(currencySymbols) as Currency[]).map((curr) => (
                <DropdownMenuItem
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={currency === curr ? 'bg-accent' : ''}
                >
                  {currencySymbols[curr]} {curr}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {mounted && isAuthenticated() ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account/favorites">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">{t('myOrders')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/favorites">{t('favorites')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">{mounted ? t('signIn') : 'Sign In'}</Link>
            </Button>
          )}

          <CartSheet>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </CartSheet>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{mounted ? t('menu') : 'Menu'}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="md:hidden">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={mounted ? t('searchPlaceholder') : 'Search...'}
                      className="w-full pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </form>
                <Link href="/products" className="text-lg font-medium">
                  {mounted ? t('allProducts') : 'All Products'}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className="text-lg font-medium"
                  >
                    {mounted ? (t(`category.${cat.slug}` as any) || cat.name) : cat.name}
                  </Link>
                ))}
                {mounted && isAuthenticated() ? (
                  <>
                    <Link href="/account" className="text-lg font-medium">
                      {t('myAccount')}
                    </Link>
                    <Link href="/account/orders" className="text-lg font-medium">
                      {t('myOrders')}
                    </Link>
                    <Link href="/account/favorites" className="text-lg font-medium">
                      {t('favorites')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium">
                      {mounted ? t('signIn') : 'Sign In'}
                    </Link>
                    <Link href="/register" className="text-lg font-medium">
                      {mounted ? t('register') : 'Register'}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
