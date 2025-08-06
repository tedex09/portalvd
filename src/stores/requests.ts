import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Request } from '@/types/models';

interface RequestsState {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    counter: string;
    search: string;
  };
  fetchRequests: (mediaType?: string, requestType?: string, sortBy?: string, sortOrder?: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: string) => Promise<void>;
  updateRequestWithRejection: (requestId: string, status: string, rejectionReason: string) => Promise<void>;
  optimisticUpdateStatus: (requestId: string, status: string) => void;
  setFilters: (filters: Partial<RequestsState['filters']>) => void;
}

export const useRequestsStore = create<RequestsState>()(
  persist(
    (set, get) => ({
      requests: [],
      isLoading: false,
      error: null,
      filters: {
        status: 'all',
        counter: 'all',
        search: ''
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters
          }
        }));
      },

      fetchRequests: async (mediaType = 'all', requestType = 'all', sortBy = '', sortOrder = 'desc') => {
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams();
          if (mediaType !== 'all') params.append('mediaType', mediaType);
          if (requestType !== 'all') params.append('requestType', requestType);
          if (sortBy) {
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);
          }
          
          const response = await fetch(`/api/admin/requests?${params.toString()}`);
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
          get().optimisticUpdateStatus(requestId, status);

          const request = get().requests.find(r => r._id === requestId);
          
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
            
            await get().fetchRequests();
          } else {
            const response = await fetch(`/api/admin/requests/${requestId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: requestId, status })
            });

            if (!response.ok) {
              throw new Error('Failed to update status');
            }

            const updatedRequest = await response.json();
            
            const requests = get().requests.map(request => 
              request._id === requestId ? { ...request, ...updatedRequest } : request
            );
            
            set({ requests });
          }
        } catch (error) {
          await get().fetchRequests();
          throw error;
        }
      },

      updateRequestWithRejection: async (requestId: string, status: string, rejectionReason: string) => {
        try {
          const request = get().requests.find(r => r._id === requestId);
          
          if (request) {
            const requests = get().requests.map(r => 
              r._id === requestId ? { ...r, status, rejectionReason } : r
            );
            set({ requests });
          }

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
            
            await get().fetchRequests();
          } else {
            const response = await fetch(`/api/admin/requests/${requestId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: requestId, status, rejectionReason })
            });

            if (!response.ok) {
              throw new Error('Failed to update status with rejection reason');
            }

            const updatedRequest = await response.json();
            
            const updatedRequests = get().requests.map(request => 
              request._id === requestId ? { ...request, ...updatedRequest } : request
            );
            
            set({ requests: updatedRequests });
          }
        } catch (error) {
          await get().fetchRequests();
          throw error;
        }
      }
    }),
    {
      name: 'requests-storage',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);