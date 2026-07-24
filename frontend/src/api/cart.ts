import { api } from "./client";
import type { AddToCartPayload, Cart } from "../types";

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>("/cart");
  return data;
}

export async function addCartItem(payload: AddToCartPayload): Promise<Cart> {
  const { data } = await api.post<Cart>("/cart/items", {
    product_id: payload.product_id,
    product_name: payload.product_name ?? null,
    quantity: payload.quantity,
  });
  return data;
}

/** Backend UpdateQuantity requires quantity > 0; use removeCartItem to delete. */
export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  if (quantity <= 0) {
    return removeCartItem(productId);
  }
  const { data } = await api.put<Cart>(`/cart/items/${productId}`, { quantity });
  return data;
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items/${productId}`);
  return data;
}

export async function clearCart(): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>("/cart");
  return data;
}
