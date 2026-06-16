export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  variantId?: string
  variantName?: string
  variantAttributes?: Record<string, string>
  maxStock: number
}

export interface CartStore {
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getSubtotal: () => number
  getTotal: () => number
  syncWithDatabase: () => Promise<void>
  initialize: () => Promise<void>
}