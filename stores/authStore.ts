import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  
  // Actions (mirip GetX controller methods)
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  login: (user, token) =>
    set({
      user,
      isAuthenticated: true,
      token: token || null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    }),

  setUser: (user) =>
    set({
      user,
    }),
}));

