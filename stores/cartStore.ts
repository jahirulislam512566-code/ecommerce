import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartStore, CartItem } from '@/types/cart'

// Helper to generate unique item ID
const generateItemId = (productId: string, variantId?: string) => {
  return variantId ? `${productId}-${variantId}` : productId
}

// Helper to check if user is logged in
const isLoggedIn = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('next-auth.session-token') || 
         !!document.cookie.includes('next-auth.session-token')
}

// Helper to dispatch cart update event
const dispatchCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
}

// API functions
const cartAPI = {
  async getCart(): Promise<CartItem[]> {
    const response = await fetch('/api/cart')
    if (!response.ok) throw new Error('Failed to fetch cart')
    const data = await response.json()
    return data.items
  },

  async addToCart(productId: string, variantId?: string, quantity: number = 1): Promise<CartItem> {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId, quantity }),
    })
    if (!response.ok) throw new Error('Failed to add to cart')
    const data = await response.json()
    return data.item
  },

  async updateCartItem(itemId: string, quantity: number): Promise<void> {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!response.ok) throw new Error('Failed to update cart')
  },

  async removeCartItem(itemId: string): Promise<void> {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to remove from cart')
  },

 // Clear entire cart
clearCart: async () => {
  console.log("clearCart called - clearing all items");
  
  // Clear local state immediately
  set({ items: [], isLoading: true });
  
  // Also clear localStorage immediately
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart-storage');
    console.log("Local storage cleared");
  }
  
  try {
    if (isLoggedIn()) {
      await cartAPI.clearCart();
      console.log("Server cart cleared");
    }
    set({ error: null });
    
    // Dispatch event to notify all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (error) {
    console.error('Clear cart error:', error);
    set({ error: 'Failed to clear cart' });
  } finally {
    set({ isLoading: false });
  }
},

  async mergeCarts(localItems: CartItem[]): Promise<void> {
    const response = await fetch('/api/cart/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: localItems }),
    })
    if (!response.ok) throw new Error('Failed to merge carts')
  },
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,

      // Initialize store
      initialize: async () => {
        const { syncWithDatabase } = get()
        await syncWithDatabase()
        dispatchCartUpdate()
      },

      // Sync with database
      syncWithDatabase: async () => {
        const { isSyncing, items } = get()
        
        if (isSyncing) return
        
        set({ isSyncing: true, error: null })
        
        try {
          const loggedIn = isLoggedIn()
          
          if (loggedIn) {
            const dbCart = await cartAPI.getCart()
            const localItems = items
            const mergedItems = [...dbCart]
            
            for (const localItem of localItems) {
              const exists = mergedItems.some(
                item => item.id === localItem.id
              )
              if (!exists) {
                mergedItems.push(localItem)
              }
            }
            
            set({ items: mergedItems, lastSyncedAt: new Date() })
            
            if (localItems.length > 0) {
              await cartAPI.mergeCarts(localItems)
            }
          } else {
            set({ lastSyncedAt: new Date() })
          }
          dispatchCartUpdate()
        } catch (error) {
          console.error('Sync error:', error)
          set({ error: 'Failed to sync cart with server' })
        } finally {
          set({ isSyncing: false })
        }
      },

      // Add item to cart
      addItem: async (item) => {
        const { items, syncWithDatabase } = get()
        const itemId = generateItemId(item.productId, item.variantId)
        
        const existingItem = items.find(i => i.id === itemId)
        
        let newItems: CartItem[]
        
        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + item.quantity,
            existingItem.maxStock
          )
          newItems = items.map(i =>
            i.id === itemId
              ? { ...i, quantity: newQuantity }
              : i
          )
        } else {
          const newItem: CartItem = {
            ...item,
            id: itemId,
          }
          newItems = [...items, newItem]
        }
        
        set({ items: newItems, isLoading: true })
        
        try {
          if (isLoggedIn()) {
            await cartAPI.addToCart(item.productId, item.variantId, item.quantity)
            await syncWithDatabase()
          }
          set({ error: null })
          dispatchCartUpdate()
        } catch (error) {
          console.error('Add to cart error:', error)
          set({ error: 'Failed to add item to cart' })
          set({ items })
        } finally {
          set({ isLoading: false })
        }
      },

      // Remove item from cart
      removeItem: async (itemId) => {
        const { items, syncWithDatabase } = get()
        const newItems = items.filter(i => i.id !== itemId)
        
        set({ items: newItems, isLoading: true })
        
        try {
          if (isLoggedIn()) {
            await cartAPI.removeCartItem(itemId)
            await syncWithDatabase()
          }
          set({ error: null })
          dispatchCartUpdate()
        } catch (error) {
          console.error('Remove from cart error:', error)
          set({ error: 'Failed to remove item from cart' })
          set({ items })
        } finally {
          set({ isLoading: false })
        }
      },

      // Update item quantity
      updateQuantity: async (itemId, quantity) => {
        const { items, syncWithDatabase } = get()
        const item = items.find(i => i.id === itemId)
        
        if (!item) return
        
        const validQuantity = Math.min(Math.max(1, quantity), item.maxStock)
        
        const newItems = items.map(i =>
          i.id === itemId ? { ...i, quantity: validQuantity } : i
        )
        
        set({ items: newItems, isLoading: true })
        
        try {
          if (isLoggedIn()) {
            await cartAPI.updateCartItem(itemId, validQuantity)
            await syncWithDatabase()
          }
          set({ error: null })
          dispatchCartUpdate()
        } catch (error) {
          console.error('Update quantity error:', error)
          set({ error: 'Failed to update quantity' })
          set({ items })
        } finally {
          set({ isLoading: false })
        }
      },

      // Clear entire cart
      clearCart: async () => {
        set({ items: [], isLoading: true })
        
        try {
          if (isLoggedIn()) {
            await cartAPI.clearCart()
          }
          // Clear localStorage
          localStorage.removeItem('cart-storage')
          set({ error: null })
          dispatchCartUpdate()
        } catch (error) {
          console.error('Clear cart error:', error)
          set({ error: 'Failed to clear cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      // Get total number of items
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      // Get subtotal
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      // Get total (with tax and shipping)
      getTotal: () => {
        const { getSubtotal } = get()
        const subtotal = getSubtotal()
        const tax = subtotal * 0.1
        const shipping = subtotal > 50 ? 0 : 5
        return subtotal + tax + shipping
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)