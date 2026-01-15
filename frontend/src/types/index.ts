export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string
  _count?: {
    products: number
  }
}

export interface ProductImage {
  id: string
  url: string
  position: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: string | number
  comparePrice: string | number | null
  sku: string | null
  stock: number
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK'
  createdAt: string
  updatedAt: string
  categoryId: string
  category: Category
  images: ProductImage[]
}

export interface OrderItem {
  id: string
  quantity: number
  price: string | number
  productName: string
  productId: string
  product: Product
}

export interface Order {
  id: string
  orderNumber: string
  customerEmail: string
  customerName: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingZip: string
  shippingCountry: string
  subtotal: string | number
  shippingCost: string | number
  total: string | number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  stripePaymentId: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

export interface Admin {
  id: string
  email: string
  name: string
}

export interface Stats {
  products: {
    total: number
    active: number
  }
  orders: {
    total: number
    today: number
    thisMonth: number
    pending: number
  }
  categories: {
    total: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
  recentOrders: Order[]
}

export interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  userId: string
  productId: string
  user: {
    id: string
    name: string
  }
}

export interface ReviewsResponse {
  reviews: Review[]
  stats: {
    averageRating: number
    totalReviews: number
  }
  pagination: Pagination
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  zip?: string
  country?: string
  createdAt: string
}
