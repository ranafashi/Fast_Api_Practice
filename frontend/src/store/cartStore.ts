import { create } from "zustand";
import * as cartApi from "../api/cart";
import type { Cart, CartItem } from "../types";

interface CartState {
  items: CartItem[];
  total: number;
  open: boolean;
  loading: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  applyCart: (cart: Cart) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, productName?: string) => Promise<void>;
  updateQty: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  open: false,
  loading: false,

  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),

  applyCart: (cart) => set({ items: cart.items, total: cart.total }),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await cartApi.getCart();
      set({ items: cart.items, total: cart.total, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addItem: async (productId, quantity, productName) => {
    const cart = await cartApi.addCartItem({
      product_id: productId,
      product_name: productName ?? null,
      quantity,
    });
    set({ items: cart.items, total: cart.total, open: true });
  },

  updateQty: async (productId, quantity) => {
    const cart = await cartApi.updateCartItem(productId, quantity);
    set({ items: cart.items, total: cart.total });
  },

  removeItem: async (productId) => {
    const cart = await cartApi.removeCartItem(productId);
    set({ items: cart.items, total: cart.total });
  },

  clear: async () => {
    await cartApi.clearCart();
    set({ items: [], total: 0 });
  },

  reset: () => set({ items: [], total: 0, open: false }),
}));
