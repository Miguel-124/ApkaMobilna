//lib/storage/auth.ts
import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) =>
    set((state) => ({
      ...state,
      user,
    })),
  logout: () =>
    set((state) => ({
      ...state,
      user: null,
    })),
}));