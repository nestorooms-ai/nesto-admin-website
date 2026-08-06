import { create } from 'zustand';
import api from './api';

export const useAdminStore = create((set) => ({
  token: localStorage.getItem('admin_token') || null,
  admin: JSON.parse(localStorage.getItem('admin_user')) || null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
  error: null,
  loading: false,
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/admin/login', { email, password });
      const { token, admin } = response.data.data;

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(admin));

      set({
        token,
        admin,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({
      token: null,
      admin: null,
      isAuthenticated: false,
      error: null
    });
  }
}));
