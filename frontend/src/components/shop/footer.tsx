import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop-Hub</h3>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for quality products at great prices.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics" className="hover:text-foreground">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing" className="hover:text-foreground">
                  Clothing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Contact Us</li>
              <li>FAQs</li>
              <li>Shipping Info</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Returns Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shop-Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
