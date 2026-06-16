// stores/cartStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  productId: string | number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === newItem.productId);
        
        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + newItem.quantity,
            existingItem.maxStock
          );
          
          set({
            items: items.map(item =>
              item.productId === newItem.productId
                ? { ...item, quantity: newQuantity }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id && item.productId !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        const item = get().items.find(i => i.id === id || i.productId === id);
        if (item && quantity <= item.maxStock) {
          set({
            items: get().items.map(item =>
              item.id === id || item.productId === id
                ? { ...item, quantity }
                : item
            )
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);