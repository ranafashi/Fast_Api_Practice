import { api } from "./client";
import type { Product, ProductImageResponse } from "../types";

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/products");
  return data;
}

/** GET /product_image — resolves a real photo URL for a product */
export async function getProductImage(params: {
  id?: number;
  name?: string;
  category?: string;
}): Promise<ProductImageResponse> {
  const { data } = await api.get<ProductImageResponse>("/product_image", { params });
  return data;
}

export async function getProductsByCategory(category: string) {
  const { data } = await api.get("/prod_categories", {
    params: { category },
  });
  return data as { id: number; name: string; category: string }[];
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/product", {
    params: { id: ids },
    paramsSerializer: { indexes: null },
  });
  return data;
}

export async function createProduct(product: Product) {
  const { data } = await api.post("/product", product);
  return data;
}

export async function createProductList(products: Product[]) {
  const { data } = await api.post("/add_product_list", products);
  return data;
}

export async function updateProduct(id: number, product: Product, name?: string) {
  const { data } = await api.put<Product>("/product", product, {
    params: { id, ...(name ? { name } : {}) },
  });
  return data;
}

export async function deleteProducts(ids: number[], name?: string) {
  const { data } = await api.delete("/product", {
    params: { id: ids, ...(name ? { name } : {}) },
    paramsSerializer: { indexes: null },
  });
  return data;
}
