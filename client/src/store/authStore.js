import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken) => set({ user, accessToken, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isLoading: false }),
  setLoading: (val) => set({ isLoading: val }),

  isAuthenticated: () => !!get().user,
  isCitizen:  () => get().user?.role === 'citizen',
  isOfficer:  () => get().user?.role === 'ward_officer',
  isAdmin:    () => get().user?.role === 'admin',
}));