import { api } from "./client";
import type { Order } from "../types";

export async function checkout(): Promise<Order> {
  const { data } = await api.post<Order>("/orders/checkout");
  return data;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/orders");
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}
