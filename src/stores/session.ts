import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import io from 'socket.io-client';

interface OnlineUser {
  id: string;
  name: string;
  lastActivity: Date;
}

interface SessionState {
  onlineUsers: OnlineUser[];
  socket: any;
  initializeSocket: () => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  updateUserActivity: (userId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      onlineUsers: [],
      socket: null,
      initializeSocket: () => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
        
        socket.on('onlineUsers', (users: OnlineUser[]) => {
          set({ onlineUsers: users });
        });

        socket.on('userConnected', (user: OnlineUser) => {
          set((state) => ({
            onlineUsers: [...state.onlineUsers, user],
          }));
        });

        socket.on('userDisconnected', (userId: string) => {
          set((state) => ({
            onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
          }));
        });

        set({ socket });
      },
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      updateUserActivity: (userId) => {
        const { socket } = get();
        if (socket) {
          socket.emit('updateActivity', userId);
        }
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({ onlineUsers: state.onlineUsers }),
    }
  )
);