import { api, setStoredToken } from "./client";
import type { SignupPayload, TokenResponse, User, UserResponse } from "../types";

export async function signup(payload: SignupPayload): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>("/add_user", {
    ...payload,
    role: payload.role ?? "customer",
  });
  return data;
}

/** Login uses OAuth2 form: username = email, password = password */
export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const { data } = await api.post<TokenResponse>("/login", body);
  setStoredToken(data.access_token);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/me");
  return data;
}

export function logout() {
  setStoredToken(null);
}
