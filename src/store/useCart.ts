import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID for the cart line item (e.g., product_id + material)
  productId: string;
  title: string;
  price: number;
  quantity: number;
  weight: number;
  imageUrl?: string;
  material?: string;
  isCustom?: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === item.id);
        if (existingItem) {
          set({
            items: items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, quantity) => set({
        items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
      }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (isOpen) => set({ isOpen }),
      cartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      cartCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'ironetch-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state like isOpen
    }
  )
);
