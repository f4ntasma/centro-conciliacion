import apiClient from '@/lib/api-client';
import { Document, DocumentFilter, PaginationParams, PaginatedResponse } from '@/types';

export const documentService = {
  getDocuments: async (params: PaginationParams & DocumentFilter): Promise<PaginatedResponse<Document>> => {
    const { data } = await apiClient.get<PaginatedResponse<Document>>('/documents', { params });
    return data;
  },

  getDocumentById: async (id: string): Promise<Document> => {
    const { data } = await apiClient.get<Document>(`/documents/${id}`);
    return data;
  },

  uploadDocument: async (file: File, metadata?: { name?: string }): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.name) {
      formData.append('name', metadata.name);
    }

    const { data } = await apiClient.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  downloadDocument: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  updateDocumentStatus: async (id: string, status: Document['status']): Promise<Document> => {
    const { data } = await apiClient.patch<Document>(`/documents/${id}`, { status });
    return data;
  },

  getDocumentStats: async () => {
    const { data } = await apiClient.get('/documents/stats');
    return data;
  },
};
