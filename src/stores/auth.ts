import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
      updateToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

// Adiciona um interceptor para atualizar o token quando expirado
export const setupAuthInterceptor = () => {
  const refreshAuthToken = async (refreshToken: string) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar token');

      const data = await response.json();
      useAuthStore.getState().updateToken(data.token);
      return data.token;
    } catch (error) {
      useAuthStore.getState().clearAuth();
      throw error;
    }
  };

  // Intercepta todas as requisições para adicionar o token
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config = {}] = args;
    
    // Não intercepta requisições de refresh token
    if (resource === '/api/auth/refresh') {
      return originalFetch(resource, config);
    }

    const state = useAuthStore.getState();
    
    if (state.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${state.token}`,
      };
    }

    try {
      const response = await originalFetch(resource, config);
      
      // Se receber 401, tenta renovar o token
      if (response.status === 401 && state.refreshToken) {
        const newToken = await refreshAuthToken(state.refreshToken);
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return originalFetch(resource, config);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };
};