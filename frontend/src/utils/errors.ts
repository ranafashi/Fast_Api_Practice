import axios from "axios";
import type { ApiErrorBody } from "../types";

const KNOWN_MESSAGES: Record<string, string> = {
  "Not enough stock": "That quantity exceeds available stock.",
  "Cart is empty": "Your cart is empty. Add items before checkout.",
  "Order not found": "That order could not be found.",
  "Product alreay exists": "A product with this ID already exists.",
  "Product already exists": "A product with this ID already exists.",
  "Duplicate ids": "Your list contains duplicate product IDs.",
  "User already exists": "An account with this email already exists.",
  "User not found": "No user found with that email.",
  "Item not in cart": "That item is not in your cart.",
  "Product not found": "Product could not be found.",
  "Invalid email or password": "Invalid email or password.",
  "Invalid email or password ": "Invalid email or password.",
  "Could not validate credentials": "Your session expired. Please sign in again.",
  "Admin access requires": "Admin access is required for this action.",
};

export function extractApiError(error: unknown, fallback = "Something went wrong"): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const status = error.response?.status;
  const body = error.response?.data as ApiErrorBody | undefined;
  let detail = "";

  if (typeof body?.detail === "string") {
    detail = body.detail;
  } else if (Array.isArray(body?.detail)) {
    detail = body.detail.map((d) => d.msg).join(", ");
  }

  if (detail && KNOWN_MESSAGES[detail]) {
    return KNOWN_MESSAGES[detail];
  }

  if (detail) return detail;

  switch (status) {
    case 400:
      return "Bad request. Please check your input.";
    case 401:
      return "Unauthorized. Please sign in again.";
    case 403:
      return "You do not have permission for this action.";
    case 404:
      return "The requested resource was not found.";
    case 422:
      return "Validation failed. Please check the form fields.";
    default:
      return fallback;
  }
}
