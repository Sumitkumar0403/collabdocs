import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api-client/axios';
import { IDashboardResponse, IDocumentSummary } from '@/shared/types';

export const documentKeys = {
  all: ['documents'] as const,
  dashboard: () => [...documentKeys.all, 'dashboard'] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  shares: (id: string) => [...documentKeys.all, 'shares', id] as const,
};

export function useDashboardDocuments() {
  return useQuery<IDashboardResponse>({
    queryKey: documentKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get('/documents');
      return response.data.data;
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: unknown) => {
      const safeTitle =
        typeof title === 'string' && title.trim()
          ? title.trim()
          : 'Untitled Document';
      const response = await apiClient.post('/documents', { title: safeTitle });
      return response.data.data as IDocumentSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
    },
  });
}

export function useImportDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/documents/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data as IDocumentSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
    },
  });
}
