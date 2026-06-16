export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderHistoryItem {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: Date
  items: OrderItem[]
  shippingAddress: any
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string
  quantity: number
  price: number
  total: number
  variantName?: string
}

export interface Address {
  id: string
  type: string
  name: string
  street: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}