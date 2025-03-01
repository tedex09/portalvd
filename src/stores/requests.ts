import { create } from 'zustand';
import { Request } from '@/types/models';

interface RequestsState {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (requestId: string, status: string) => Promise<void>;
  updateRequestWithRejection: (requestId: string, status: string, rejectionReason: string) => Promise<void>;
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

      // Get the request to check if it has a counter > 1
      const request = get().requests.find(r => r._id === requestId);
      
      // If the request has a counter > 1, we need to update all requests with the same mediaId, mediaType, and type
      if (request && request.counter > 1) {
        const response = await fetch(`/api/admin/requests/update-batch`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mediaId: request.mediaId, 
            mediaType: request.mediaType, 
            type: request.type,
            status 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update batch status');
        }
        
        // Refresh all requests after batch update
        await get().fetchRequests();
      } else {
        // Regular single request update
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
      }
    } catch (error) {
      // Revert optimistic update on error
      await get().fetchRequests();
      throw error;
    }
  },

  updateRequestWithRejection: async (requestId: string, status: string, rejectionReason: string) => {
    try {
      // Get the request to check if it has a counter > 1
      const request = get().requests.find(r => r._id === requestId);
      
      // Optimistically update the UI
      if (request) {
        const requests = get().requests.map(r => 
          r._id === requestId ? { ...r, status, rejectionReason } : r
        );
        set({ requests });
      }

      // If the request has a counter > 1, we need to update all requests with the same mediaId, mediaType, and type
      if (request && request.counter > 1) {
        const response = await fetch(`/api/admin/requests/update-batch`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mediaId: request.mediaId, 
            mediaType: request.mediaType, 
            type: request.type,
            status,
            rejectionReason
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update batch status with rejection reason');
        }
        
        // Refresh all requests after batch update
        await get().fetchRequests();
      } else {
        // Regular single request update
        const response = await fetch(`/api/admin/requests/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: requestId, status, rejectionReason })
        });

        if (!response.ok) {
          throw new Error('Failed to update status with rejection reason');
        }

        const updatedRequest = await response.json();
        
        // Update with server response to ensure consistency
        const updatedRequests = get().requests.map(request => 
          request._id === requestId ? { ...request, ...updatedRequest } : request
        );
        
        set({ requests: updatedRequests });
      }
    } catch (error) {
      // Revert optimistic update on error
      await get().fetchRequests();
      throw error;
    }
  }
}));