export interface Address {
  city: string;
  postal_Code: number;
}

export interface User {
  _id?: string;
  name: string;
  password?: string;
  age: number;
  email: string;
  address: Address;
  role: "customer" | "admin" | string;
}

export interface UserResponse {
  name: string;
  age: number;
  email: string;
}

export interface SignupPayload {
  name: string;
  password: string;
  age: number;
  email: string;
  address: Address;
  role?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export interface ProductImageResponse {
  product_id: number | null;
  name?: string | null;
  category?: string | null;
  image_url: string;
  source: "stored" | "resolved" | string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string | null;
}

export interface Order {
  order_id: string;
  user_id: string;
  customer_email?: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface AddToCartPayload {
  product_id: number;
  product_name?: string | null;
  quantity: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CityUserRow {
  name: string;
  age: number;
  city: string;
}

export interface UserCountByCity {
  _id: string;
  UsersCount: number;
}

export interface AvgAgeByCity {
  _id: string;
  AvgUserAge: number;
}

export interface DeleteUserResponse {
  message: string;
  details: UserResponse;
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[];
}
