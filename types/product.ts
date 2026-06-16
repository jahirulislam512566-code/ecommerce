export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
  order: number
}

export interface ProductVariant {
  id: string
  sku: string
  name?: string
  attributes: Record<string, string>
  price?: number
  comparePrice?: number
  quantity: number
  image?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  sku: string
  quantity: number
  lowStockThreshold: number
  status: string
  visibility: string
  featured: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  category?: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt: Date
  updatedAt: Date
}