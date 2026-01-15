import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
