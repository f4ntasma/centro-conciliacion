import apiClient from '@/lib/api-client';
import { Reconciliation, ReconciliationDetail, PaginationParams, PaginatedResponse } from '@/types';

export const reconciliationService = {
  getReconciliations: async (
    params: PaginationParams
  ): Promise<PaginatedResponse<Reconciliation>> => {
    const { data } = await apiClient.get<PaginatedResponse<Reconciliation>>('/reconciliations', {
      params,
    });
    return data;
  },

  getReconciliationById: async (id: string): Promise<ReconciliationDetail> => {
    const { data } = await apiClient.get<ReconciliationDetail>(`/reconciliations/${id}`);
    return data;
  },

  createReconciliation: async (
    reconciliation: Omit<Reconciliation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'progress'>
  ): Promise<Reconciliation> => {
    const { data } = await apiClient.post<Reconciliation>('/reconciliations', reconciliation);
    return data;
  },

  updateReconciliation: async (
    id: string,
    reconciliation: Partial<Reconciliation>
  ): Promise<Reconciliation> => {
    const { data } = await apiClient.patch<Reconciliation>(
      `/reconciliations/${id}`,
      reconciliation
    );
    return data;
  },

  deleteReconciliation: async (id: string): Promise<void> => {
    await apiClient.delete(`/reconciliations/${id}`);
  },

  startReconciliation: async (id: string): Promise<Reconciliation> => {
    const { data } = await apiClient.post<Reconciliation>(`/reconciliations/${id}/start`, {});
    return data;
  },

  cancelReconciliation: async (id: string): Promise<Reconciliation> => {
    const { data } = await apiClient.post<Reconciliation>(`/reconciliations/${id}/cancel`, {});
    return data;
  },

  getReconciliationStats: async () => {
    const { data } = await apiClient.get('/reconciliations/stats');
    return data;
  },
};
