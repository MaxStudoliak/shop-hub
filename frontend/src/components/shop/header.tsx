'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, Heart, Moon, Sun, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Separator } from '@/components/ui/separator'
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
  const totalItems = useCartStore((state) => state.getTotalItems())
  const cartHasHydrated = useCartStore((state) => state.hasHydrated)
  const { user, isAuthenticated, logout, hasHydrated: userHasHydrated } = useUserStore()
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency, t, hasHydrated: settingsHasHydrated } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [rightMenuOpen, setRightMenuOpen] = useState(false)
  const router = useRouter()

  const mounted = cartHasHydrated && userHasHydrated && settingsHasHydrated

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
      <div className="container flex h-14 md:h-16 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg md:text-xl font-bold">Shop-Hub</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Search */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto">
              <SheetHeader className="sr-only">
                <SheetTitle>Search</SheetTitle>
                <SheetDescription>Search for products</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSearch} className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={mounted ? t('searchPlaceholder') : 'Search...'}
                    className="pl-10 h-12 text-base"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {/* Desktop Search */}
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

          {/* Language Switcher - Desktop only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
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

          {/* Currency Switcher - Desktop only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium h-9 px-2 hidden md:flex">
                {mounted ? currencySymbols[currency] : '₴'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[100px]">
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

          {/* Theme Toggle - Desktop only */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 hidden md:flex">
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Favorites - Desktop only */}
          {mounted && isAuthenticated() && (
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 hidden md:flex">
              <Link href="/account/favorites">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* User Menu - Desktop only */}
          {mounted && isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.name}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">{t('profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="cursor-pointer">{t('myOrders')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/favorites" className="cursor-pointer">{t('favorites')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild size="sm" className="h-9 px-3 hidden md:flex">
              <Link href="/login">{mounted ? t('signIn') : 'Sign In'}</Link>
            </Button>
          )}

          <CartSheet>
            <Button variant="outline" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>
          </CartSheet>

          <Sheet open={rightMenuOpen} onOpenChange={setRightMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col h-full overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-800 dark:via-purple-800 dark:to-indigo-800 border-l-2 border-purple-200 dark:border-purple-500/30">
              <SheetHeader className="border-b border-purple-200 dark:border-purple-400/30 pb-4 flex-shrink-0 bg-white/50 dark:bg-slate-700/30 backdrop-blur-sm -mx-6 px-6 -mt-6 pt-6">
                <SheetTitle className="text-left text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent font-bold">
                  {mounted ? t('menu') : 'Menu'}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu with categories, profile, and settings
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-3">
                <nav className="flex flex-col gap-1 pr-2 pb-16">
                  {/* Products Section */}
                  <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-transparent dark:border-purple-400/30">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1 px-2">
                      {mounted ? t('shop') : 'Shop'}
                    </p>
                    <Link
                      href="/products"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-all text-sm font-medium hover:scale-[1.02] transform"
                      onClick={() => setRightMenuOpen(false)}
                    >
                      {mounted ? t('allProducts') : 'All Products'}
                    </Link>
                  </div>

                  {/* Categories */}
                  <div className="mt-1 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-transparent dark:border-purple-400/30">
                    <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1 px-2">
                      {mounted ? t('category') : 'Categories'}
                    </p>
                    <div className="space-y-0.5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/products?category=${cat.slug}`}
                          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-all text-xs hover:scale-[1.02] transform"
                          onClick={() => setRightMenuOpen(false)}
                        >
                          {mounted ? (t(`category.${cat.slug}` as any) || cat.name) : cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-1 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent" />

                  {/* Profile Section */}
                  {mounted && isAuthenticated() ? (
                    <div className="mt-1 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-transparent dark:border-purple-400/30">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-600/30 dark:hover:to-purple-600/30 transition-all text-sm font-medium hover:scale-[1.02] transform"
                        onClick={() => setRightMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        {t('profile')}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setRightMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-600/30 dark:hover:to-pink-600/30 transition-all text-sm font-medium text-red-600 dark:text-red-400 mt-0.5 hover:scale-[1.02] transform"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-0.5 mt-1 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-transparent dark:border-purple-400/30">
                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-all text-sm font-medium hover:scale-[1.02] transform"
                        onClick={() => setRightMenuOpen(false)}
                      >
                        {mounted ? t('signIn') : 'Sign In'}
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-all text-sm font-medium hover:scale-[1.02] transform"
                        onClick={() => setRightMenuOpen(false)}
                      >
                        {mounted ? t('register') : 'Register'}
                      </Link>
                    </div>
                  )}

                  <Separator className="my-1 bg-gradient-to-r from-transparent via-pink-300 dark:via-pink-700 to-transparent" />

                  {/* Settings Section */}
                  <div className="mt-1 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-transparent dark:border-purple-400/30">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1.5 px-2">
                      {mounted ? t('settings') : 'Settings'}
                    </p>

                    {/* Language */}
                    <div className="mb-1.5 px-2">
                      <p className="text-xs font-medium mb-1">{mounted ? t('language') : 'Language'}</p>
                      <div className="flex gap-1">
                        {(Object.keys(languages) as Language[]).map((lang) => (
                          <Button
                            key={lang}
                            size="sm"
                            variant={language === lang ? 'default' : 'outline'}
                            onClick={() => setLanguage(lang)}
                            className={`text-xs px-2 h-7 ${language === lang ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
                          >
                            {lang.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Currency */}
                    <div className="mb-1.5 px-2">
                      <p className="text-xs font-medium mb-1">{mounted ? t('currency') : 'Currency'}</p>
                      <div className="flex gap-1 flex-wrap">
                        {(Object.keys(currencySymbols) as Currency[]).map((curr) => (
                          <Button
                            key={curr}
                            size="sm"
                            variant={currency === curr ? 'default' : 'outline'}
                            onClick={() => setCurrency(curr)}
                            className={`text-xs px-2 h-7 ${currency === curr ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
                          >
                            {curr}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Theme */}
                    <div className="px-2">
                      <p className="text-xs font-medium mb-1">{mounted ? t('theme') : 'Theme'}</p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={theme === 'light' ? 'default' : 'outline'}
                          onClick={() => theme === 'dark' && toggleTheme()}
                          className={`flex-1 h-7 ${theme === 'light' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
                          aria-label={t('lightMode') || 'Light mode'}
                        >
                          <Sun className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          onClick={() => theme === 'light' && toggleTheme()}
                          className={`flex-1 h-7 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
                          aria-label={t('darkMode') || 'Dark mode'}
                        >
                          <Moon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
