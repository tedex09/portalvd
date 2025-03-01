import { create } from 'zustand';
import { Request } from '@/types/models';

interface RequestsState {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (requestId: string, status: string) => Promise<void>;
  optimisticUpdateStatus: (requestId: string, status: string) => void;
}

export const useRequestsStore = create<RequestsState>((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      set({ requests: data.items, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch requests', isLoading: false });
    }
  },

  optimisticUpdateStatus: (requestId: string, status: string) => {
    const requests = get().requests.map(request => 
      request._id === requestId ? { ...request, status } : request
    );
    set({ requests });
  },

  updateRequestStatus: async (requestId: string, status: string) => {
    try {
      // Optimistically update the UI
      get().optimisticUpdateStatus(requestId, status);

      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedRequest = await response.json();
      
      // Update with server response to ensure consistency
      const requests = get().requests.map(request => 
        request._id === requestId ? { ...request, ...updatedRequest } : request
      );
      
      set({ requests });
    } catch (error) {
      // Revert optimistic update on error
      await get().fetchRequests();
      throw error;
    }
  }
}));