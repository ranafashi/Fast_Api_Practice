import { create } from "zustand";
import * as authApi from "../api/auth";
import { getStoredToken, registerUnauthorizedHandler, setStoredToken } from "../api/client";
import type { SignupPayload, User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  registerUnauthorizedHandler(() => {
    set({ user: null, token: null });
  });

  return {
    user: null,
    token: getStoredToken(),
    loading: false,
    hydrated: false,

    hydrate: async () => {
      const token = getStoredToken();
      if (!token) {
        set({ user: null, token: null, hydrated: true });
        return;
      }
      try {
        const user = await authApi.fetchMe();
        set({ user, token, hydrated: true });
      } catch {
        setStoredToken(null);
        set({ user: null, token: null, hydrated: true });
      }
    },

    login: async (email, password) => {
      set({ loading: true });
      try {
        const { access_token } = await authApi.login(email, password);
        const user = await authApi.fetchMe();
        set({ token: access_token, user, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    signup: async (payload) => {
      set({ loading: true });
      try {
        await authApi.signup(payload);
        await get().login(payload.email, payload.password);
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    logout: () => {
      authApi.logout();
      set({ user: null, token: null, loading: false });
    },

    refreshMe: async () => {
      const user = await authApi.fetchMe();
      set({ user });
    },
  };
});
