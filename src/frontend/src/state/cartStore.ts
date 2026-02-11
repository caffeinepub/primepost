import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, StoreId, ProductId } from '../backend';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: Record<StoreId, CartItem[]>;
  addItem: (storeId: StoreId, product: Product, quantity?: number) => void;
  removeItem: (storeId: StoreId, productId: ProductId) => void;
  updateQuantity: (storeId: StoreId, productId: ProductId, quantity: number) => void;
  clearCart: (storeId: StoreId) => void;
  getStoreCart: (storeId: StoreId) => CartItem[];
  getStoreTotal: (storeId: StoreId) => bigint;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      addItem: (storeId, product, quantity = 1) => {
        set((state) => {
          const storeItems = state.items[storeId] || [];
          const existingIndex = storeItems.findIndex((item) => item.product.id === product.id);

          if (existingIndex >= 0) {
            const updated = [...storeItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: { ...state.items, [storeId]: updated } };
          } else {
            return {
              items: {
                ...state.items,
                [storeId]: [...storeItems, { product, quantity }],
              },
            };
          }
        });
      },
      removeItem: (storeId, productId) => {
        set((state) => {
          const storeItems = state.items[storeId] || [];
          return {
            items: {
              ...state.items,
              [storeId]: storeItems.filter((item) => item.product.id !== productId),
            },
          };
        });
      },
      updateQuantity: (storeId, productId, quantity) => {
        set((state) => {
          const storeItems = state.items[storeId] || [];
          const updated = storeItems.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          return { items: { ...state.items, [storeId]: updated } };
        });
      },
      clearCart: (storeId) => {
        set((state) => {
          const { [storeId]: _, ...rest } = state.items;
          return { items: rest };
        });
      },
      getStoreCart: (storeId) => {
        return get().items[storeId] || [];
      },
      getStoreTotal: (storeId) => {
        const items = get().items[storeId] || [];
        return items.reduce((total, item) => {
          const price = item.product.discount
            ? item.product.price - (item.product.price * item.product.discount) / 100n
            : item.product.price;
          return total + price * BigInt(item.quantity);
        }, 0n);
      },
    }),
    {
      name: 'primepost-cart',
    }
  )
);
